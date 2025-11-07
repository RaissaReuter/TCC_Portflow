// ARQUIVO NOVO: backend/src/services/openaiService.ts

import OpenAI from 'openai';
import { IQuestao } from '../models/Questao';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Definimos um tipo mais específico para o que esperamos da IA
type QuestaoGerada = Omit<IQuestao, '_id' | 'createdAt' | 'updatedAt'>;

export const gerarQuestoesComIA = async (topico: string, quantidade: number): Promise<QuestaoGerada[]> => {
  const superPrompt = `
    Atue como um Especialista em Elaboração de Questões de Língua Portuguesa para o ENEM.
    Sua tarefa é criar ${quantidade} questões de múltipla escolha (A, B, C, D, E) sobre o tópico "${topico}".

    Instruções:
    1. Formato de Saída: Responda APENAS com um objeto JSON que contenha uma única chave "questoes", cujo valor seja um array de objetos JSON. Exemplo: { "questoes": [...] }. Não inclua nenhum texto ou explicação fora do JSON.
    2. Estrutura do JSON: Cada objeto no array deve ter os campos: "topico", "enunciado", "imagemUrl" (use null se não houver imagem), "alternativas" (um array de 5 objetos com "letra" e "texto"), e "respostaCorreta".
    3. Estilo ENEM: Use textos de apoio, distratores plausíveis e comandos claros. Para imagens, descreva a imagem no enunciado e use uma URL placeholder.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125', // Modelo otimizado para JSON
      messages: [{ role: 'user', content: superPrompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    
    // Podemos remover o console.log agora que sabemos que funciona
    console.log('--- RESPOSTA BRUTA DA IA ---');
    console.log(content);
    console.log('----------------------------');

    if (!content) {
      throw new Error('A IA não retornou conteúdo.');
    }

    // --- LÓGICA DE EXTRAÇÃO CORRIGIDA ---
    const parsedJson = JSON.parse(content);
    
    // Acessamos diretamente a chave "questoes" que a IA nos deu
    const arrayDeQuestoes = parsedJson.questoes;

    if (!Array.isArray(arrayDeQuestoes) || arrayDeQuestoes.length === 0) {
      throw new Error('A IA não retornou um array de questões válido dentro da chave "questoes".');
    }

    return arrayDeQuestoes as QuestaoGerada[];

  } catch (error) {
    console.error("Erro ao gerar questões com a IA:", error);
    throw new Error('Falha ao se comunicar com a IA para gerar questões.');
  }
};