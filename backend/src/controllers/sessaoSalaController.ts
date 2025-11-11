import { Request, Response } from 'express';
import { z } from 'zod';
import { IUser } from '../models/user';
import QuestaoModel from '../models/Questao';
import SessaoSalaModel from '../models/SessaoSala';
import { gerarQuestoesComIA } from '../services/openaiService';

// Função para gerar um código de 6 caracteres alfanuméricos
const gerarCodigoUnico = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Schema de validação para a criação da turma
const criarSessaoSchema = z.object({
  nome: z.string().min(3, "O nome da sessão é obrigatório."),
  topico: z.string().min(1, "O tópico é obrigatório."),
  quantidadeQuestoes: z.number().min(1, "A quantidade de questões deve ser no mínimo 1.").max(50),
  duracaoMinutos: z.number().min(1, "A duração deve ser de no mínimo 1 minuto."),
  habilitarPomodoro: z.boolean().optional(),
});

// --- FUNÇÃO PARA CRIAR SESSÃO ---
export const criarSessao = async (req: Request, res: Response) => {
  try {
    const dadosSessao = criarSessaoSchema.parse(req.body);
    const professor = (req as any).user as IUser;

    if (professor.role !== 'professor') {
      return res.status(403).json({ message: 'Apenas professores podem criar sessões.' });
    }

    const questoesGeradas = await gerarQuestoesComIA(dadosSessao.topico, dadosSessao.quantidadeQuestoes);
    const novasQuestoes = await QuestaoModel.insertMany(questoesGeradas);
    const idsDasNovasQuestoes = novasQuestoes.map(q => q._id);
    const codigo = gerarCodigoUnico();

    const novaSessao = await SessaoSalaModel.create({
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

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados de entrada inválidos.', errors: error.issues });
    }
    if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
    }
    console.error("Erro ao criar sessão:", error);
    res.status(500).json({ message: 'Erro interno no servidor ao criar sessão.' });
  }
};

// --- FUNÇÃO PARA ALUNO ENTRAR NA SESSÃO ---
export const entrarNaSessao = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.body;
    const aluno = (req as any).user as IUser;

    if (!codigo) {
      return res.status(400).json({ message: 'O código da sessão é obrigatório.' });
    }

    const sessao = await SessaoSalaModel.findOne({ codigo: codigo.toUpperCase(), status: 'AGUARDANDO' });

    if (!sessao) {
      return res.status(404).json({ message: 'Sessão não encontrada ou já iniciada.' });
    }

    const alunoJaParticipa = sessao.participantes.some(
      p => String(p.alunoId) === String(aluno._id)
    );

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

  } catch (error) {
    console.error("Erro ao entrar na sessão:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// --- FUNÇÃO PARA BUSCAR O STATUS DA SESSÃO ---
export const getStatusSessao = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user as IUser;

    const sessao = await SessaoSalaModel.findById(id)
      .populate({
        path: 'participantes.alunoId',
        select: 'name email'
      })
      .populate('questoes');

    if (!sessao) {
      return res.status(404).json({ message: 'Sessão não encontrada.' });
    }

    const isProfessor = String(sessao.professor) === String(user._id);
    const isParticipante = sessao.participantes.some(p => String((p.alunoId as any)._id) === String(user._id));

    if (!isProfessor && !isParticipante) {
      return res.status(403).json({ message: 'Você não tem permissão para ver esta sessão.' });
    }

    res.status(200).json(sessao);

  } catch (error) {
    console.error("Erro ao buscar status da sessão:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// --- FUNÇÃO PARA INICIAR SESSÃO ---
export const iniciarSessao = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user as IUser;

    const sessao = await SessaoSalaModel.findById(id);

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

  } catch (error) {
    console.error("Erro ao iniciar sessão:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// --- FUNÇÃO PARA RESPONDER QUESTÃO (ATUALIZADA) ---
export const responderQuestao = async (req: Request, res: Response) => {
  try {
    const { sessaoId, questaoId, resposta } = req.body;
    const aluno = (req as any).user as IUser;

    if (!sessaoId || !questaoId || !resposta) {
      return res.status(400).json({ message: 'Dados da resposta incompletos.' });
    }

    const [sessao, questao] = await Promise.all([
      SessaoSalaModel.findById(sessaoId),
      QuestaoModel.findById(questaoId)
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

  } catch (error) {
    console.error("Erro ao responder questão:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// --- FUNÇÃO PARA FINALIZAR SESSÃO ---
export const finalizarSessao = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user as IUser;

    const sessao = await SessaoSalaModel.findById(id);

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

  } catch (error) {
    console.error("Erro ao finalizar sessão:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};