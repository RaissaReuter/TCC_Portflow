import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';
import UserModel, { IUser } from '../models/user'; // 1. ADICIONADA A IMPORTAÇÃO DE 'IUser'
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- FUNÇÃO PARA BUSCAR O USUÁRIO LOGADO (MODIFICADA) ---
export const getMe = async (req: Request, res: Response) => {
  // 2. ACESSAMOS O USUÁRIO ATRAVÉS DO "CAST" DE TIPO
  const user = (req as any).user as IUser;

  // A verificação da existência do usuário já foi feita no middleware 'protect'.
  // Aqui, apenas retornamos os dados do usuário que já foram anexados à requisição.
  res.status(200).json({ user });
}; // 3. CORRIGIDO O '}' QUE FALTAVA AQUI NO SEU CÓDIGO ORIGINAL

// --- FUNÇÃO DE LOGIN COM GOOGLE ---
export const googleLogin = async (req: Request, res: Response) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: 'Token do Google inválido.' });
    } 
    const { sub: googleId, email, name } = payload;

    let user = await UserModel.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await UserModel.create({
        googleId,
        email,
        name,
        role: 'aluno',
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não está definido.');
    }
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: '30d', // Sessão persistente de 30 dias
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ 
      message: 'Login com Google bem-sucedido!', 
      token, 
      user: userResponse 
    });

  } catch (error) {
    console.error("Erro no login com Google:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
};


// --- SCHEMA DE VALIDAÇÃO PARA LOGIN TRADICIONAL ---
const loginSchema = z.object({
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

// --- FUNÇÃO DE LOGIN TRADICIONAL ---
// (Mantive o nome original 'loginUser' para corresponder ao seu 'authRoutes.ts')
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Se o usuário só tem login com Google, ele não terá senha
    if (!user.password) {
      return res.status(401).json({ message: 'Esta conta foi criada com o Google. Por favor, use o login social.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não está definido no arquivo .env');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: '30d',
    });
    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ 
      message: 'Login bem-sucedido!', 
      token, 
      user: userResponse 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos.', errors: error.issues});
    }
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao tentar fazer login.' });
  }
};