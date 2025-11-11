"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.googleLogin = exports.getMe = void 0;
const google_auth_library_1 = require("google-auth-library");
const user_1 = __importDefault(require("../models/user")); // 1. ADICIONADA A IMPORTAÇÃO DE 'IUser'
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// --- FUNÇÃO PARA BUSCAR O USUÁRIO LOGADO (MODIFICADA) ---
const getMe = async (req, res) => {
    // 2. ACESSAMOS O USUÁRIO ATRAVÉS DO "CAST" DE TIPO
    const user = req.user;
    // A verificação da existência do usuário já foi feita no middleware 'protect'.
    // Aqui, apenas retornamos os dados do usuário que já foram anexados à requisição.
    res.status(200).json({ user });
}; // 3. CORRIGIDO O '}' QUE FALTAVA AQUI NO SEU CÓDIGO ORIGINAL
exports.getMe = getMe;
// --- FUNÇÃO DE LOGIN COM GOOGLE ---
const googleLogin = async (req, res) => {
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
        let user = await user_1.default.findOne({ email });
        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        }
        else {
            user = await user_1.default.create({
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
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, jwtSecret, {
            expiresIn: '30d', // Sessão persistente de 30 dias
        });
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(200).json({
            message: 'Login com Google bem-sucedido!',
            token,
            user: userResponse
        });
    }
    catch (error) {
        console.error("Erro no login com Google:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};
exports.googleLogin = googleLogin;
// --- SCHEMA DE VALIDAÇÃO PARA LOGIN TRADICIONAL ---
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Formato de e-mail inválido."),
    password: zod_1.z.string().min(1, "A senha é obrigatória."),
});
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "O nome precisa ter no mínimo 3 caracteres."),
    email: zod_1.z.string().email("Formato de e-mail inválido."),
    password: zod_1.z.string().min(6, "A senha precisa ter no mínimo 6 caracteres."),
    // A validação de 'role' foi removida daqui
});
// --- FUNÇÃO DE LOGIN TRADICIONAL ---
// (Mantive o nome original 'loginUser' para corresponder ao seu 'authRoutes.ts')
const loginUser = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await user_1.default.findOne({ email }).select('+password');
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
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, jwtSecret, {
            expiresIn: '30d',
        });
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(200).json({
            message: 'Login bem-sucedido!',
            token,
            user: userResponse
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao tentar fazer login.' });
    }
};
exports.loginUser = loginUser;
