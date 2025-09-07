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

// ... (depois da função getDetalheSecao)

export const getDetalheEtapa = async (req: AuthRequest, res: Response) => {
  try {
    const { secaoOrder, etapaOrder } = req.params;

    // Encontra a seção e filtra para retornar apenas a etapa desejada
    const secao = await SecaoModel.findOne(
      { order: Number(secaoOrder) },
      { etapas: { $elemMatch: { order: Number(etapaOrder) } } }
    );

    if (!secao || secao.etapas.length === 0) {
      return res.status(404).json({ message: "Etapa não encontrada." });
    }

    // A resposta será a primeira (e única) etapa no array filtrado
    const etapa = secao.etapas[0];
    res.status(200).json({ etapa });

  } catch (error) {
    console.error("Erro ao buscar detalhes da etapa:", error);
    res.status(500).json({ message: "Erro ao buscar detalhes da etapa." });
  }
};

// ... (depois da função getDetalheEtapa)

export const completarEtapa = async (req: AuthRequest, res: Response) => {
  try {
    const alunoId = req.user?._id;
    
    // Busca o progresso atual do aluno
    const progresso = await ProgressoAlunoModel.findOne({ alunoId });

    if (!progresso) {
      return res.status(404).json({ message: "Progresso do aluno não encontrado." });
    }

    // --- Lógica de Avanço ---
    // Aqui, simplesmente avançamos para a próxima etapa.
    // Em uma versão futura, poderíamos verificar se a seção terminou para avançar para a próxima seção.
    progresso.etapaAtual += 1;
    
    // Adiciona a etapa concluída ao histórico (opcional, mas bom para o futuro)
    // progresso.etapasConcluidas.push(...) 

    await progresso.save();

    res.status(200).json({ message: "Etapa concluída com sucesso!", progresso });

  } catch (error) {
    console.error("Erro ao completar etapa:", error);
    res.status(500).json({ message: "Erro ao atualizar progresso." });
  }
};