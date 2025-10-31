import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SecaoModel, { IEtapaData, IQuizQuestionData, IEnemExampleData } from './src/models/Secao';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface IEtapaGerada {
  content: Record<string, any>;
  quiz: IQuizQuestionData[];
  enem_explanation: string;
  enem_example: IEnemExampleData;
}

async function gerarEtapaCompleta(tema: string): Promise<IEtapaGerada> {
  console.log(`Gerando conteúdo completo para: "${tema}"...`);
  try {
    const prompt = `
      Você é um especialista em criar material didático de Língua Portuguesa para o ENEM.
      Sua tarefa é criar uma aula completa sobre o tema "${tema}".
      Sua resposta DEVE ser um objeto JSON válido.
      O objeto JSON deve ter QUATRO chaves: "content", "quiz", "enem_explanation", e "enem_example".

      1. "content": Um objeto JSON representando a teoria da aula, com seções e subtópicos. Cada seção deve ter "title" e "text".
      2. "quiz": Um array com 4 perguntas de autoavaliação. Cada pergunta DEVE ter as chaves "questionText", "options" (4 strings), "correctAnswerIndex" (0-3), e "explanation" (justificativa detalhada e obrigatória).
      3. "enem_explanation": Uma string explicando como o tema cai no ENEM.
      4. "enem_example":
        - O valor desta chave DEVE ser um OBJETO JSON.
        - **PRIMEIRO, encontre um TEXTO DE APOIO (um fragmento de crônica, artigo, poema, etc.) de uma questão real do ENEM (2020-2023) que seja relevante para o tema "${tema}".**
        - **SEGUNDO, transcreva este TEXTO DE APOIO na íntegra para a chave "supportText". NÃO RESUMA. TRANSCREVA.**
        - **TERCEIRO, crie a questão associada a esse texto de apoio.**
        - O objeto final deve ter as seguintes chaves:
          - "source": (string) A fonte exata (ex: "ENEM 2022, Questão 98").
          - "supportText": (string) O texto de apoio que você transcreveu.
          - "questionText": (string) O enunciado da questão.
          - "options": (array de 5 strings) As alternativas.
          - "correctAnswerIndex": (number) O índice da resposta correta (0-4).
          - "explanation": (string) Uma explicação detalhada da resposta.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const conteudoJsonString = response.choices[0]?.message?.content;
    if (conteudoJsonString) {
      const conteudoGerado: IEtapaGerada = JSON.parse(conteudoJsonString);
      console.log(`Conteúdo para "${tema}" gerado com sucesso!`);
      return conteudoGerado;
    } else {
      throw new Error("A resposta da API da OpenAI veio vazia.");
    }
  } catch (error) {
    console.error(`Erro ao gerar conteúdo para "${tema}":`, error);
    return {
      content: { "erro": "Falha ao gerar conteúdo." },
      quiz: [],
      enem_explanation: "",
      enem_example: {} as IEnemExampleData
    };
  }
}

const seedDatabase = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI || !process.env.OPENAI_API_KEY) {
    console.error("MONGO_URI ou OPENAI_API_KEY não encontradas no .env!");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB Conectado para seeding...");

    type EtapaSeedObject = Partial<IEtapaData> & { title: string; icon: string; order: number };

    const secao1Data = {
      title: "Seção 1 - Fundamentos da Compreensão Textual",
      description: "Domine a base da leitura e interpretação!",
      order: 1,
      etapas: [
        { title: "Coesão e Coerência", icon: "book", order: 1 },
        { title: "Tipos e Gêneros Textuais", icon: "pencil", order: 2 },
        { title: "Funções da Linguagem", icon: "abc", order: 3 },
        { title: "Figuras de Linguagem", icon: "info", order: 4 },
      ] as EtapaSeedObject[]
    };

    for (const etapa of secao1Data.etapas) {
      const etapaCompleta = await gerarEtapaCompleta(etapa.title);
      etapa.content = etapaCompleta.content;
      etapa.quiz = etapaCompleta.quiz;
      etapa.enem_explanation = etapaCompleta.enem_explanation;
      etapa.enem_example = etapaCompleta.enem_example;
    }

    await SecaoModel.deleteMany({});
    console.log("Seções antigas removidas.");

    await SecaoModel.create(secao1Data);
    console.log("Seção 1 criada com sucesso com conteúdo completo e interativo!");

  } catch (error) {
    console.error("Erro CRÍTICO no script de seed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Desconectado.");
  }
};

seedDatabase();