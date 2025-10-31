// ARQUIVO CORRIGIDO E FINAL: backend/src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/user'; // Importamos a interface IUser

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não está definido');
      }
      
      const decoded = jwt.verify(token, jwtSecret) as { id: string };

      // Buscamos o usuário no banco de dados
      const currentUser = await UserModel.findById(decoded.id).select('-password');
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
      }

      // Anexamos o usuário à requisição, fazendo um "cast" de tipo
      // para que o resto da aplicação saiba o que esperar.
      (req as any).user = currentUser;

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Não autorizado, token inválido' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido' });
  }
};