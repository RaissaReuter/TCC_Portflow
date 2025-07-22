import { Request, Response } from 'express';
import UserModel from '../models/user';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const loginSchema = z.object({
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(1, "A senha é obrigatória."), // Apenas verificamos se não está vazia
});

export const loginUser = async (req: Request, res: Response) => {
  try {
    // 1. Validar os dados de entrada
    const { email, password } = loginSchema.parse(req.body);

    // 2. Encontrar o usuário pelo email
    // Usamos .select('+password') para forçar a inclusão do campo da senha,
    // que por padrão não é retornado.
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 3. Comparar a senha fornecida com a senha no banco
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // 401 Unauthorized
    }
    
    // 4. Gerar o Token JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não está definido no arquivo .env');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: '7d', // Token expira em 7 dias
    });
    
    // 5. Enviar a resposta com o token
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