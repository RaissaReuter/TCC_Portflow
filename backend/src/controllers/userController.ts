import { Request, Response } from 'express';
import UserModel, { IUser } from '../models/user';
import { z } from 'zod';
// A importação de 'AuthRequest' foi removida, pois não é mais necessária.

const registerSchema = z.object({
  name: z.string().min(3, "O nome precisa ter no mínimo 3 caracteres."),
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres."),
});

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const user = new UserModel({
      name,
      email,
      password,
    });
    
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

export const getUserProfile = async (req: Request, res: Response) => {
  // CORREÇÃO: Usar o cast '(req as any).user'
  const user = (req as any).user;
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};

export const setUserRole = async (req: Request, res: Response) => {
  const { role } = req.body;
  const user = (req as any).user as IUser;

  if (role !== 'aluno' && role !== 'professor') {
    return res.status(400).json({ message: 'Papel inválido. Escolha "aluno" ou "professor".' });
  }

  if (user.role) {
    return res.status(400).json({ message: 'O seu papel já foi definido e não pode ser alterado.' });
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    { role },
    { new: true }
  ).select('-password');

  if (!updatedUser) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  res.status(200).json(updatedUser);
};