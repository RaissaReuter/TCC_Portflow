// /src/controllers/redacaoController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import OpenAI from 'openai';
import { z, ZodError } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const redacaoSchema = z.object({
  tema: z.string().min(1, "O tema não pode estar vazio."),
  texto: z.string().min(50, "A redação precisa ter no mínimo 50 caracteres."),
});

export const analisarRedacao = async (req: AuthRequest, res: Response) => {
  try {
    const { tema, texto } = redacaoSchema.parse(req.body);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const systemPrompt = `Você é um assistente útil.`;
    const userMessageContent = `Diga apenas a palavra "teste".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent } // Usando o novo formato
      ],
      temperature: 0.5,
      max_tokens: 512,
    });

    const assistantResponse = completion.choices[0].message.content;

    res.status(200).json({ reply: assistantResponse });

  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Dados da redação inválidos.", errors: error.issues });
    }
    
    // MELHORIA: Log de erro mais detalhado para erros da OpenAI
    if (error instanceof OpenAI.APIError) {
        console.error("Erro da API da OpenAI:", error.status, error.message, error.code, error.type);
        return res.status(error.status || 500).json({ message: `Erro da OpenAI: ${error.message}` });
    }

    console.error("Erro desconhecido na API de Redação:", error);
    res.status(500).json({ message: "Ocorreu um erro inesperado ao processar sua redação." });
  }
};