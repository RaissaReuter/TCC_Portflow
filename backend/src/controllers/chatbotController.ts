// /src/controllers/chatbotController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
// import OpenAI from 'openai'; // Não precisamos mais disso no modo simulado
import { z } from 'zod';

/*
// Bloco da OpenAI desativado temporariamente
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
*/

const chatSchema = z.object({
  message: z.string().min(1, "A mensagem não pode estar vazia.").max(500, "A mensagem é muito longa."),
});

export const handleChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = chatSchema.parse(req.body);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    // --- MODO SIMULADO ---
    // Aqui, em vez de chamar a OpenAI, retornamos uma resposta fixa.
    
    console.log(`[Modo Simulado] Mensagem recebida de ${user.name}: "${message}"`);

    const assistantResponse = `Olá, ${user.name}! Recebi sua mensagem: "${message}". No momento, estou em modo de simulação. A conexão real com a IA será ativada em breve!`;

    // Adicionamos um pequeno delay para simular o tempo de resposta da rede
    setTimeout(() => {
      res.status(200).json({ reply: assistantResponse });
    }, 1000); // Responde após 1 segundo

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Mensagem inválida.", errors: error.issues });
    }
    console.error("Erro no Chatbot (Modo Simulado):", error);
    res.status(500).json({ message: "Ocorreu um erro ao processar sua mensagem." });
  }
};