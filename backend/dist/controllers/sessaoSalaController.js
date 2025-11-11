"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizarSessao = exports.responderQuestao = exports.iniciarSessao = exports.getStatusSessao = exports.entrarNaSessao = exports.criarSessao = void 0;
const zod_1 = require("zod");
const Questao_1 = __importDefault(require("../models/Questao"));
const SessaoSala_1 = __importDefault(require("../models/SessaoSala"));
const openaiService_1 = require("../services/openaiService");
// Função para gerar um código de 6 caracteres alfanuméricos
const gerarCodigoUnico = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
// Schema de validação para a criação da turma
const criarSessaoSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3, "O nome da sessão é obrigatório."),
    topico: zod_1.z.string().min(1, "O tópico é obrigatório."),
    quantidadeQuestoes: zod_1.z.number().min(1, "A quantidade de questões deve ser no mínimo 1.").max(50),
    duracaoMinutos: zod_1.z.number().min(1, "A duração deve ser de no mínimo 1 minuto."),
    habilitarPomodoro: zod_1.z.boolean().optional(),
});
// --- FUNÇÃO PARA CRIAR SESSÃO ---
const criarSessao = async (req, res) => {
    try {
        const dadosSessao = criarSessaoSchema.parse(req.body);
        const professor = req.user;
        if (professor.role !== 'professor') {
            return res.status(403).json({ message: 'Apenas professores podem criar sessões.' });
        }
        const questoesGeradas = await (0, openaiService_1.gerarQuestoesComIA)(dadosSessao.topico, dadosSessao.quantidadeQuestoes);
        const novasQuestoes = await Questao_1.default.insertMany(questoesGeradas);
        const idsDasNovasQuestoes = novasQuestoes.map(q => q._id);
        const codigo = gerarCodigoUnico();
        const novaSessao = await SessaoSala_1.default.create({
            nome: dadosSessao.nome,
            topico: dadosSessao.topico,
            professor: professor._id,
            codigo,
            status: 'AGUARDANDO',
            questoes: idsDasNovasQuestoes,
            configuracao: {
                duracaoMinutos: dadosSessao.duracaoMinutos,
                habilitarPomodoro: dadosSessao.habilitarPomodoro || false,
            },
            participantes: [],
        });
        res.status(201).json(novaSessao);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Dados de entrada inválidos.', errors: error.issues });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        console.error("Erro ao criar sessão:", error);
        res.status(500).json({ message: 'Erro interno no servidor ao criar sessão.' });
    }
};
exports.criarSessao = criarSessao;
// --- FUNÇÃO PARA ALUNO ENTRAR NA SESSÃO ---
const entrarNaSessao = async (req, res) => {
    try {
        const { codigo } = req.body;
        const aluno = req.user;
        if (!codigo) {
            return res.status(400).json({ message: 'O código da sessão é obrigatório.' });
        }
        const sessao = await SessaoSala_1.default.findOne({ codigo: codigo.toUpperCase(), status: 'AGUARDANDO' });
        if (!sessao) {
            return res.status(404).json({ message: 'Sessão não encontrada ou já iniciada.' });
        }
        const alunoJaParticipa = sessao.participantes.some(p => String(p.alunoId) === String(aluno._id));
        if (alunoJaParticipa) {
            return res.status(200).json({ message: 'Você já está nesta sessão.', sessao });
        }
        // Adicionamos o aluno com questaoAtual: 0 por padrão (definido no Schema)
        sessao.participantes.push({
            alunoId: aluno._id,
            respostas: [],
            pontuacao: 0,
            questaoAtual: 0, // Podemos ser explícitos, mas o default no schema já faz isso
        });
        await sessao.save();
        res.status(200).json({ message: 'Você entrou na sessão com sucesso!', sessao });
    }
    catch (error) {
        console.error("Erro ao entrar na sessão:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
exports.entrarNaSessao = entrarNaSessao;
// --- FUNÇÃO PARA BUSCAR O STATUS DA SESSÃO ---
const getStatusSessao = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const sessao = await SessaoSala_1.default.findById(id)
            .populate({
            path: 'participantes.alunoId',
            select: 'name email'
        })
            .populate('questoes');
        if (!sessao) {
            return res.status(404).json({ message: 'Sessão não encontrada.' });
        }
        const isProfessor = String(sessao.professor) === String(user._id);
        const isParticipante = sessao.participantes.some(p => String(p.alunoId._id) === String(user._id));
        if (!isProfessor && !isParticipante) {
            return res.status(403).json({ message: 'Você não tem permissão para ver esta sessão.' });
        }
        res.status(200).json(sessao);
    }
    catch (error) {
        console.error("Erro ao buscar status da sessão:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
exports.getStatusSessao = getStatusSessao;
// --- FUNÇÃO PARA INICIAR SESSÃO ---
const iniciarSessao = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const sessao = await SessaoSala_1.default.findById(id);
        if (!sessao) {
            return res.status(404).json({ message: 'Sessão não encontrada.' });
        }
        if (String(sessao.professor) !== String(user._id)) {
            return res.status(403).json({ message: 'Apenas o professor da turma pode iniciar a atividade.' });
        }
        if (sessao.status !== 'AGUARDANDO') {
            return res.status(400).json({ message: `A sessão não pode ser iniciada (status atual: ${sessao.status}).` });
        }
        sessao.status = 'EM_ANDAMENTO';
        sessao.tempoInicio = new Date();
        await sessao.save();
        res.status(200).json({ message: 'Sessão iniciada com sucesso!', sessao });
    }
    catch (error) {
        console.error("Erro ao iniciar sessão:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
exports.iniciarSessao = iniciarSessao;
// --- FUNÇÃO PARA RESPONDER QUESTÃO (ATUALIZADA) ---
const responderQuestao = async (req, res) => {
    try {
        const { sessaoId, questaoId, resposta } = req.body;
        const aluno = req.user;
        if (!sessaoId || !questaoId || !resposta) {
            return res.status(400).json({ message: 'Dados da resposta incompletos.' });
        }
        const [sessao, questao] = await Promise.all([
            SessaoSala_1.default.findById(sessaoId),
            Questao_1.default.findById(questaoId)
        ]);
        if (!sessao || !questao) {
            return res.status(404).json({ message: 'Sessão ou questão não encontrada.' });
        }
        if (sessao.status !== 'EM_ANDAMENTO') {
            return res.status(400).json({ message: 'Esta atividade não está em andamento.' });
        }
        const participante = sessao.participantes.find(p => String(p.alunoId) === String(aluno._id));
        if (!participante) {
            return res.status(403).json({ message: 'Você não é um participante desta sessão.' });
        }
        const jaRespondeu = participante.respostas.some(r => String(r.questaoId) === String(questaoId));
        if (jaRespondeu) {
            return res.status(400).json({ message: 'Você já respondeu esta questão.' });
        }
        const acertou = questao.respostaCorreta === resposta;
        if (acertou) {
            participante.pontuacao += 10;
        }
        participante.respostas.push({ questaoId, acertou });
        // --- LÓGICA ADICIONADA ---
        // 1. Encontrar o índice da questão que foi respondida
        const indiceQuestaoRespondida = sessao.questoes.findIndex(id => String(id) === String(questaoId));
        // 2. Atualizar o campo 'questaoAtual' do participante para o próximo índice
        // Se o aluno respondeu a questão de índice 0, ele agora está na questão de índice 1.
        if (indiceQuestaoRespondida !== -1) {
            participante.questaoAtual = indiceQuestaoRespondida + 1;
        }
        // --- FIM DA LÓGICA ADICIONADA ---
        await sessao.save();
        res.status(200).json({ acertou, pontuacao: participante.pontuacao });
    }
    catch (error) {
        console.error("Erro ao responder questão:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
exports.responderQuestao = responderQuestao;
// --- FUNÇÃO PARA FINALIZAR SESSÃO ---
const finalizarSessao = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const sessao = await SessaoSala_1.default.findById(id);
        if (!sessao) {
            return res.status(404).json({ message: 'Sessão não encontrada.' });
        }
        if (String(sessao.professor) !== String(user._id)) {
            return res.status(403).json({ message: 'Apenas o professor pode finalizar a atividade.' });
        }
        if (sessao.status === 'FINALIZADA') {
            return res.status(400).json({ message: 'Esta sessão já foi finalizada.' });
        }
        sessao.status = 'FINALIZADA';
        await sessao.save();
        await sessao.populate({ path: 'participantes.alunoId', select: 'name' });
        res.status(200).json({ message: 'Sessão finalizada com sucesso!', sessao });
    }
    catch (error) {
        console.error("Erro ao finalizar sessão:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
exports.finalizarSessao = finalizarSessao;
