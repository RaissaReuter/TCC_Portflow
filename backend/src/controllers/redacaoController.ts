// /src/controllers/redacaoController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import OpenAI from 'openai';
import { z, ZodError } from 'zod';

// Configuração do cliente da OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema de validação com limites ajustados
const redacaoSchema = z.object({
  tema: z.string().min(1, "O tema não pode estar vazio.").max(300, "O tema é muito longo."),
  texto: z.string().min(50, "A redação precisa ter no mínimo 50 caracteres."),
});

export const analisarRedacao = async (req: AuthRequest, res: Response) => {
  try {
    const { tema, texto } = redacaoSchema.parse(req.body);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    // O prompt de sistema que instrui a IA a retornar um JSON
    const systemPrompt = `Você é um corretor especialista do ENEM para a plataforma PortFlow. Sua tarefa é analisar a redação de um aluno e retornar um feedback ESTRITAMENTE no formato JSON.

    O JSON de saída deve ter a seguinte estrutura:
    {
      "analiseGeral": "Um parágrafo curto com suas impressões gerais sobre o texto.",
      "pontosFortes": [
        { "competencia": "C1", "descricao": "Descreva um ponto positivo aqui, relacionado à Competência 1." },
        { "competencia": "C2", "descricao": "Descreva um ponto positivo aqui, relacionado à Competência 2." }
      ],
      "pontosAMelhorar": [
        { "competencia": "C3", "descricao": "Aponte uma área para melhoria com sugestões, relacionado à Competência 3." },
        { "competencia": "C4", "descricao": "Aponte outra área para melhoria com sugestões, relacionado à Competência 4." }
      ],
      "sugestaoFinal": "Finalize com uma frase de encorajamento para o estudante ${user.name}.",
      "errosSugeridos": [
        { "palavra": "palavra_errada_no_texto", "sugestao": "sugestão_de_correção" }
      ]
    }
    Identifique até 3 erros ortográficos ou gramaticais e preencha 'errosSugeridos'. Se não houver erros, retorne um array vazio []. NÃO adicione nenhum texto antes ou depois do objeto JSON.`;

    const userPrompt = `Tema: "${tema}"\n\nRedação: "${texto}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125", // Modelo otimizado para seguir formatos
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }, // Força a saída em JSON
      temperature: 0.5,
    });

    const assistantResponse = completion.choices[0].message.content;

    if (!assistantResponse) {
      throw new Error("A IA não retornou um conteúdo válido.");
    }

    // Transforma a string JSON em um objeto JavaScript
    const feedbackJson = JSON.parse(assistantResponse);

    // CORREÇÃO: Envia o objeto parseado com a chave 'feedback'
    res.status(200).json({ feedback: feedbackJson });

  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Dados da redação inválidos.", errors: error.issues });
    }
    if (error instanceof OpenAI.APIError) {
        console.error("Erro da API da OpenAI:", error.status, error.message);
        return res.status(error.status || 500).json({ message: `Erro da OpenAI: ${error.message}` });
    }
    console.error("Erro desconhecido na API de Redação:", error);
    res.status(500).json({ message: "Ocorreu um erro inesperado ao processar sua redação." });
  }
};