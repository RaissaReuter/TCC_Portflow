// ARQUIVO CORRIGIDO E FINAL: backend/src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/user'; // Importamos a interface IUser

// Interface para requisições autenticadas
export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔐 Middleware de autenticação executado');
  console.log('📋 Headers recebidos:', req.headers.authorization ? 'Authorization header presente' : 'Authorization header ausente');
  
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token extraído:', token ? 'Token presente' : 'Token vazio');

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('❌ JWT_SECRET não está definido');
        throw new Error('JWT_SECRET não está definido');
      }
      
      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      console.log('✅ Token decodificado com sucesso, ID do usuário:', decoded.id);

      // Buscamos o usuário no banco de dados
      const currentUser = await UserModel.findById(decoded.id).select('-password');
      
      if (!currentUser) {
        console.log('❌ Usuário não encontrado no banco de dados');
        return res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
      }

      console.log('✅ Usuário autenticado:', currentUser.name);
      // Anexamos o usuário à requisição
      req.user = currentUser;

      next();
    } catch (error) {
      console.error('❌ Erro na verificação do token:', error);
      return res.status(401).json({ message: 'Não autorizado, token inválido' });
    }
  } else {
    console.log('❌ Header Authorization não encontrado ou formato inválido');
    return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido' });
  }
};