// /src/controllers/trilhaController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import SecaoModel from '../models/Secao';
import ProgressoAlunoModel from '../models/ProgressoAluno';

// Rota para a tela principal (lista de seções)
export const getListaSecoes = async (req: AuthRequest, res: Response) => {
  try {
    const alunoId = req.user?._id;
    const secoes = await SecaoModel.find().sort({ order: 1 });
    let progresso = await ProgressoAlunoModel.findOne({ alunoId });

    if (!progresso) {
      progresso = await ProgressoAlunoModel.create({ alunoId });
    }

    res.status(200).json({ secoes, progresso });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar seções." });
  }
};

// Rota para a tela de uma seção específica
export const getDetalheSecao = async (req: AuthRequest, res: Response) => {
    try {
        const alunoId = req.user?._id;
        const { secaoOrder } = req.params; // Pega a ordem da seção da URL

        const secao = await SecaoModel.findOne({ order: Number(secaoOrder) });
        if (!secao) {
            return res.status(404).json({ message: "Seção não encontrada." });
        }

        let progresso = await ProgressoAlunoModel.findOne({ alunoId });
        if (!progresso) {
            progresso = await ProgressoAlunoModel.create({ alunoId });
        }

        res.status(200).json({ secao, progresso });
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar detalhes da seção." });
    }
};