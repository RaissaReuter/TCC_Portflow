// /src/controllers/chatbotController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import axios from 'axios';
import { z, ZodError } from 'zod';

// CORREÇÃO FINAL: Usando um modelo Llama 3 brasileiro, ativo e verificado
const API_URL = "https://api-inference.huggingface.co/models/NeuroNove/Llama-3-8B-Instruct-8k-Portuguese-PT-BR";

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

    const headers = {
      "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`
    };

    // CORREÇÃO: Usando o formato de prompt ideal para modelos Llama-Instruct
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Você é o "Portinho", um assistente de IA amigável e especialista em Língua Portuguesa para o ENEM. Seu nome é Portinho. Responda de forma clara, didática e encorajadora. Se a pergunta for fora do escopo, recuse educadamente.<|eot_id|><|start_header_id|>user<|end_header_id|>
Olá! Meu nome é ${user.name}. Minha pergunta é: ${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    const response = await axios.post<{ generated_text: string }[]>(API_URL, {
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        repetition_penalty: 1.1
      }
    }, { headers });

    let assistantResponse = response.data[0]?.generated_text || "Não consegui pensar em uma resposta agora, tente novamente!";
    
    // CORREÇÃO: Limpeza de resposta otimizada para o formato Llama
    const cleanResponse = assistantResponse.split("<|start_header_id|>assistant<|end_header_id|>")[1];
    if (cleanResponse) {
        assistantResponse = cleanResponse.replace(/<\|eot_id\|>$/, "").trim();
    }

    res.status(200).json({ reply: assistantResponse });

  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Mensagem inválida.", errors: error.issues });
    }
    if (axios.isAxiosError(error)) {
        console.error("Erro na API do Chatbot (Hugging Face):", error.response?.data);
        const errorMessage = (error.response?.data as any)?.error || "Ocorreu um erro ao processar sua mensagem.";
        return res.status(500).json({ message: errorMessage });
    }
    console.error("Erro desconhecido na API do Chatbot:", error);
    res.status(500).json({ message: "Ocorreu um erro inesperado." });
  }
};