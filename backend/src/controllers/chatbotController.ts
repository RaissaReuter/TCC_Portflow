// /src/controllers/chatbotController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import OpenAI from 'openai';
import { z, ZodError } from 'zod';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const chatSchema = z.object({
  message: z.string().min(1, "A mensagem não pode estar vazia.").max(2000, "A mensagem é muito longa (máximo 2000 caracteres)."),
});

export const handleChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        message: "Serviço de chat temporariamente indisponível. Configure a chave da OpenAI." 
      });
    }

    const { message } = chatSchema.parse(req.body);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const systemPrompt = `Você é o "Portinho", um assistente de IA amigável e especialista em Língua Portuguesa para o ENEM. Seu nome é Portinho. Responda de forma clara, didática e encorajadora para o usuário ${user.name}. Se a pergunta for fora do escopo, recuse educadamente.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const assistantResponse = completion.choices[0].message.content;

    res.status(200).json({ reply: assistantResponse });

  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Mensagem inválida.", errors: error.issues });
    }
    console.error("Erro na API do Chatbot (OpenAI):", error);
    res.status(500).json({ message: "Ocorreu um erro ao processar sua mensagem." });
  }
};