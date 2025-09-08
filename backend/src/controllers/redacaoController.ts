// /src/controllers/redacaoController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import OpenAI from 'openai';
import { z, ZodError } from 'zod';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const redacaoSchema = z.object({
  tema: z.string().min(1, "O tema não pode estar vazio.").max(200, "O tema é muito longo (máximo 200 caracteres)."),
  texto: z.string().min(50, "A redação precisa ter no mínimo 50 caracteres.").max(5000, "A redação é muito longa (máximo 5000 caracteres)."),
});

const truncarTexto = (texto: string, maxLength: number): string => {
  if (texto.length <= maxLength) {
    return texto;
  }
  return texto.substring(0, maxLength); // Removemos o aviso para não confundir a IA
};

export const analisarRedacao = async (req: AuthRequest, res: Response) => {
  console.log("Iniciando análise de redação...");
  try {
    console.log("Verificando configuração da OpenAI...");
    if (!openai) {
      return res.status(503).json({ 
        message: "Serviço de análise de redação temporariamente indisponível. Configure a chave da OpenAI." 
      });
    }


    const { tema, texto } = redacaoSchema.parse(req.body);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const systemPrompt = `...
O JSON de saída deve ter a seguinte estrutura:
{
  "analiseGeral": "...",
  "pontosFortes": [...],
  "pontosAMelhorar": [...],
  "sugestaoFinal": "...",
  "errosSugeridos": [
    { "palavra": "palavra_errada_encontrada_no_texto", "sugestao": "sugestão_de_correção" }
  ]
}
Identifique até 3 erros ortográficos ou gramaticais simples no texto e preencha o array 'errosSugeridos'. Se não houver erros claros, retorne um array vazio [].`;
    const userMessageContent = `Tema: ${tema}\n\nTexto da redação:\n${texto}\n\nPor favor, analise esta redação e forneça feedback detalhado.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent } // Usando o novo formato
      ],
      temperature: 0.7,
    
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