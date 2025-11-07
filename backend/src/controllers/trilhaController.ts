// /src/controllers/trilhaController.ts
import SecaoModel from '../models/Secao';
import ProgressoAlunoModel from '../models/ProgressoAluno';
import{ Request, Response } from 'express';

// Rota para a tela principal (lista de seções)
export const getListaSecoes = async (req:Request, res: Response) => {
  try {
    const alunoId = (req as any).user?._id;
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
export const getDetalheSecao = async (req: Request, res: Response) => {
    try {
        const alunoId = (req as any).user?._id;
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

export const getDetalheEtapa = async (req: Request, res: Response) => {
  try {
    const { secaoOrder, etapaOrder } = req.params;

    // --- MUDANÇA PRINCIPAL AQUI ---
    // Em vez de filtrar no banco, vamos pegar a seção inteira e encontrar a etapa no código.
    // Isso é mais robusto para campos complexos como 'Mixed'.
    const secao = await SecaoModel.findOne({ order: Number(secaoOrder) });

    if (!secao) {
      return res.status(404).json({ message: "Seção não encontrada." });
    }

    // Encontra a etapa específica dentro do array de etapas da seção
    const etapa = secao.etapas.find(e => e.order === Number(etapaOrder));

    if (!etapa) {
      return res.status(404).json({ message: "Etapa não encontrada." });
    }

    // Agora temos o objeto 'etapa' completo, com todos os seus campos.
    res.status(200).json({ etapa });

  } catch (error) {
    console.error("Erro ao buscar detalhes da etapa:", error);
    res.status(500).json({ message: "Erro ao buscar detalhes da etapa." });
  }
};

// ... (depois da função getDetalheEtapa)

// ... (outras funções do controller permanecem as mesmas)

export const completarEtapa = async (req: Request, res: Response) => {
  try {
    const alunoId = (req as any).user?._id;
    if (!alunoId) {
      return res.status(400).json({ message: "ID do aluno não encontrado no token." });
    }

    const progresso = await ProgressoAlunoModel.findOne({ alunoId });
    if (!progresso) {
      return res.status(404).json({ message: "Progresso do aluno não encontrado." });
    }

    // --- NOVA LÓGICA DE AVANÇO INTELIGENTE ---

    // 1. Identificar a etapa que o aluno acabou de concluir.
    const secaoConcluida = progresso.secaoAtual;
    const etapaConcluida = progresso.etapaAtual;

    // 2. Adicionar a etapa ao histórico de conclusões.
    // Evita adicionar duplicatas se o aluno refizer uma aula.
    const jaConcluida = progresso.etapasConcluidas.some(
      ec => ec.secao === secaoConcluida && ec.etapa === etapaConcluida
    );
    if (!jaConcluida) {
      progresso.etapasConcluidas.push({ secao: secaoConcluida, etapa: etapaConcluida });
    }

    // 3. Descobrir qual é a próxima etapa.
    // Buscar a seção atual para saber quantas etapas ela tem.
    const secaoAtualDb = await SecaoModel.findOne({ order: secaoConcluida });
    if (!secaoAtualDb) {
      return res.status(404).json({ message: "Seção atual não encontrada no banco de dados." });
    }

    const totalEtapasNaSecao = secaoAtualDb.etapas.length;

    // 4. Decidir se avança para a próxima etapa ou para a próxima seção.
    if (etapaConcluida < totalEtapasNaSecao) {
      // Ainda há etapas nesta seção, então apenas avançamos a etapa.
      progresso.etapaAtual += 1;
    } else {
      // O aluno terminou a última etapa da seção.
      // Vamos avançar para a primeira etapa da próxima seção.
      const totalSecoes = await SecaoModel.countDocuments();
      if (secaoConcluida < totalSecoes) {
        progresso.secaoAtual += 1;
        progresso.etapaAtual = 1; // Reseta para a primeira etapa da nova seção.
      } else {
        // O aluno completou a última etapa da última seção. Trilha concluída!
        // Aqui você pode adicionar uma lógica especial, se desejar.
        // Por enquanto, o progresso simplesmente para de avançar.
        console.log(`Aluno ${alunoId} completou toda a trilha!`);
      }
    }

    await progresso.save();

    res.status(200).json({ message: "Etapa concluída com sucesso!", progresso });

  } catch (error) {
    console.error("Erro ao completar etapa:", error);
    res.status(500).json({ message: "Erro ao atualizar progresso." });
  }
};