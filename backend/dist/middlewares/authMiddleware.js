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
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            console.log('✅ Token decodificado com sucesso, ID do usuário:', decoded.id);
            // Buscamos o usuário no banco de dados
            const currentUser = await user_1.default.findById(decoded.id).select('-password');
            if (!currentUser) {
                console.log('❌ Usuário não encontrado no banco de dados');
                return res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
            }
            console.log('✅ Usuário autenticado:', currentUser.name);
            // Anexamos o usuário à requisição
            req.user = currentUser;
            next();
        }
        catch (error) {
            console.error('❌ Erro na verificação do token:', error);
            return res.status(401).json({ message: 'Não autorizado, token inválido' });
        }
    }
    else {
        console.log('❌ Header Authorization não encontrado ou formato inválido');
        return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido' });
    }
};
exports.protect = protect;
