"use strict";
// ARQUIVO NOVO: backend/src/controllers/turmaController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarTurma = void 0;
const Turma_1 = __importDefault(require("../models/Turma"));
const zod_1 = require("zod");
// Função para gerar um código de 6 caracteres alfanuméricos
const gerarCodigoUnico = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
// Schema de validação para a criação da turma
const criarTurmaSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3, "O nome da turma deve ter pelo menos 3 caracteres."),
});
const criarTurma = async (req, res) => {
    try {
        // 1. Validar os dados de entrada (o nome da turma)
        const { nome } = criarTurmaSchema.parse(req.body);
        // 2. Identificar o professor que está fazendo a requisição
        const professor = req.user;
        if (professor.role !== 'professor') {
            return res.status(403).json({ message: 'Apenas professores podem criar turmas.' });
        }
        // 3. Gerar um código único para a turma
        // (Em um sistema real, teríamos uma lógica para garantir que o código não se repita)
        const codigo = gerarCodigoUnico();
        // 4. Criar a nova turma no banco de dados
        const novaTurma = await Turma_1.default.create({
            nome,
            professor: professor._id,
            alunos: [], // Começa com uma lista de alunos vazia
            codigo,
        });
        // 5. Enviar a turma recém-criada como resposta
        res.status(201).json(novaTurma);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
        }
        console.error("Erro ao criar turma:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
exports.criarTurma = criarTurma;
