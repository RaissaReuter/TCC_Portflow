import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/user';

// Estendendo a interface Request do Express para incluir nossa propriedade 'user'
export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // 1. Verificar se o token existe e está no formato correto ("Bearer TOKEN")
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extrair o token do cabeçalho
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificar o token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não está definido');
      }
      const decoded = jwt.verify(token, jwtSecret) as { id: string };

      // 4. Encontrar o usuário pelo ID do token e anexar à requisição
      // Excluímos a senha da seleção por segurança
      req.user = await UserModel.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
      }

      next(); // 5. Passar para o próximo middleware/controller
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Não autorizado, token inválido' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido' });
  }
};