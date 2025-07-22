// /src/controllers/userController.ts

import { Response } from 'express';
import UserModel from '../models/user';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware'; // Importamos a interface que criamos

// Schema de validação para o registro
const registerSchema = z.object({
  name: z.string().min(3, "O nome precisa ter no mínimo 3 caracteres."),
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres."),
  role: z.enum(['aluno', 'professor']),
});

// Função para REGISTRAR um usuário
export const registerUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const user = new UserModel({
      name,
      email,
      password,
      role,
    });
    
    // O campo password precisa ser setado explicitamente para o hook pre-save funcionar
    user.password = password;

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ message: 'Usuário criado com sucesso!', user: userResponse });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao tentar registrar o usuário.' });
  }
};

// Função para BUSCAR O PERFIL do usuário logado
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  // O middleware 'protect' já encontrou o usuário e o anexou a req.user
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    // Essa checagem é uma segurança extra, mas o middleware 'protect' já deve ter barrado a requisição se não encontrasse o usuário
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};