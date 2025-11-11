"use strict";
// ARQUIVO CORRIGIDO E FINAL: backend/src/middlewares/authMiddleware.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user")); // Importamos a interface IUser
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new Error('JWT_SECRET não está definido');
            }
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            // Buscamos o usuário no banco de dados
            const currentUser = await user_1.default.findById(decoded.id).select('-password');
            if (!currentUser) {
                return res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
            }
            // Anexamos o usuário à requisição
            req.user = currentUser;
            next();
        }
        catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Não autorizado, token inválido' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido' });
    }
};
exports.protect = protect;
