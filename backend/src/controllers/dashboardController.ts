// /src/controllers/dashboardController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  // Graças ao middleware 'protect', já temos os dados do usuário em req.user
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }
  
  try {
    // --- LÓGICA PARA BUSCAR O PROGRESSO ---
    // Por enquanto, como ainda não temos os modelos de progresso,
    // vamos retornar dados FALSOS (mockados).
    // Isso permite que você conecte seu frontend AGORA.
    // Depois, substituiremos isso por buscas reais no banco.

    const mockProgress = {
      grammarLesson: {
        hasStarted: true,
        progressPercentage: 75,
        title: "Aula 2 de Gramática de Trilha"
      },
      writingLesson: {
        hasStarted: true,
        progressPercentage: 45,
        title: "Redação sobre Lugares Ambientais"
      },
      // Exemplo de uma atividade não iniciada:
      figuresOfSpeechLesson: {
        hasStarted: false,
        progressPercentage: 0,
        title: "Trilha de Figuras de Linguagem"
      }
    };

    const dashboardData = {
      userName: user.name,
      progress: mockProgress,
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};