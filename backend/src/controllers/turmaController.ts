// ARQUIVO NOVO: backend/src/controllers/turmaController.ts

import { Request, Response } from 'express';
import TurmaModel from '../models/Turma';
import { IUser } from '../models/user';
import { z } from 'zod';

// Função para gerar um código de 6 caracteres alfanuméricos
const gerarCodigoUnico = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Schema de validação para a criação da turma
const criarTurmaSchema = z.object({
  nome: z.string().min(3, "O nome da turma deve ter pelo menos 3 caracteres."),
});

export const criarTurma = async (req: Request, res: Response) => {
  try {
    // 1. Validar os dados de entrada (o nome da turma)
    const { nome } = criarTurmaSchema.parse(req.body);

    // 2. Identificar o professor que está fazendo a requisição
    const professor = (req as any).user as IUser;
    if (professor.role !== 'professor') {
      return res.status(403).json({ message: 'Apenas professores podem criar turmas.' });
    }

    // 3. Gerar um código único para a turma
    // (Em um sistema real, teríamos uma lógica para garantir que o código não se repita)
    const codigo = gerarCodigoUnico();

    // 4. Criar a nova turma no banco de dados
    const novaTurma = await TurmaModel.create({
      nome,
      professor: professor._id,
      alunos: [], // Começa com uma lista de alunos vazia
      codigo,
    });

    // 5. Enviar a turma recém-criada como resposta
    res.status(201).json(novaTurma);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }
    console.error("Erro ao criar turma:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};