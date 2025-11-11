"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserRole = exports.getUserProfile = exports.registerUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const zod_1 = require("zod");
// A importação de 'AuthRequest' foi removida, pois não é mais necessária.
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "O nome precisa ter no mínimo 3 caracteres."),
    email: zod_1.z.string().email("Formato de e-mail inválido."),
    password: zod_1.z.string().min(6, "A senha precisa ter no mínimo 6 caracteres."),
});
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = registerSchema.parse(req.body);
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'E-mail já cadastrado.' });
        }
        const user = new user_1.default({
            name,
            email,
            password,
        });
        user.password = password;
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json({ message: 'Usuário criado com sucesso!', user: userResponse });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao tentar registrar o usuário.' });
    }
};
exports.registerUser = registerUser;
const getUserProfile = async (req, res) => {
    // CORREÇÃO: Usar o cast '(req as any).user'
    const user = req.user;
    if (user) {
        res.status(200).json(user);
    }
    else {
        res.status(404).json({ message: 'Usuário não encontrado' });
    }
};
exports.getUserProfile = getUserProfile;
const setUserRole = async (req, res) => {
    const { role } = req.body;
    const user = req.user;
    if (role !== 'aluno' && role !== 'professor') {
        return res.status(400).json({ message: 'Papel inválido. Escolha "aluno" ou "professor".' });
    }
    if (user.role) {
        return res.status(400).json({ message: 'O seu papel já foi definido e não pode ser alterado.' });
    }
    const updatedUser = await user_1.default.findByIdAndUpdate(user._id, { role }, { new: true }).select('-password');
    if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json(updatedUser);
};
exports.setUserRole = setUserRole;
