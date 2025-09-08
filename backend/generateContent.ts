// /backend/generateContent.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import cliProgress from 'cli-progress'; // Para a barra de progresso
import SecaoModel from './src/models/Secao';

dotenv.config();

// --- CONFIGURAÇÃO ---
const TEMAS_DAS_AULAS = [
  { title: "Aula 1: Tipos Textuais", icon: "book", order: 1 },
  { title: "Aula 2: Gêneros Textuais", icon: "pencil", order: 2 },
  { title: "Aula 3: Coesão e Coerência", icon: "abc", order: 3 },
  { title: "Aula 4: Figuras de Linguagem", icon: "repeat", order: 4 },
  { title: "Aula 5: Variação Linguística", icon: "undo", order: 5 },
  { title: "Aula 6: Funções da Linguagem", icon: "info", order: 6 },
  { title: "Aula 7: Interpretação de Texto", icon: "flag", order: 7 },
];

// --- CONEXÃO COM A IA ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `...
O JSON deve ter a seguinte estrutura:
{
  "content": "...",
  "quiz": [
    {
      "questionText": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswerIndex": 0,
      "explanation": "Uma breve explicação do porquê esta é a resposta correta, com no máximo 2 frases." // <-- NOVO CAMPO
    }
  ]
}`;

// --- FUNÇÃO PRINCIPAL ---
const generateAndSeedContent = async () => {
  console.log("Iniciando gerador de conteúdo com IA...");

  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error("MONGO_URI não encontrada!");
    return;
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB Conectado.");

    // Limpa a coleção de seções antes de começar
    await SecaoModel.deleteMany({});
    console.log("Coleção de seções limpa.");

    const novasEtapas: {
      title: string;
      icon: string;
      order: number;
      content: string;
      quiz: {
        questionText: string;
        options: string[];
        correctAnswerIndex: number;
      }[];
    }[] = [];
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    
    console.log("Gerando conteúdo para as aulas...");
    progressBar.start(TEMAS_DAS_AULAS.length, 0);

    for (const tema of TEMAS_DAS_AULAS) {
      const systemPrompt = `Você é um especialista em conteúdo didático para o ENEM. Sua tarefa é criar o material para uma aula e um quiz relacionado. Retorne sua resposta ESTRITAMENTE no formato JSON.
      
      O JSON deve ter a seguinte estrutura:
      {
        "content": "Um texto em HTML (use tags como <h1>, <p>, <strong>) explicando o tópico de forma clara e concisa, com exemplos. Máximo de 3 parágrafos.",
        "quiz": [
          {
            "questionText": "Uma pergunta de múltipla escolha sobre o conteúdo da aula.",
            "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
            "correctAnswerIndex": 0
          }
        ]
      }`;
      
      const userPrompt = `Gere o conteúdo e o quiz para a aula com o tema: "${tema.title}"`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Usando o modelo mais inteligente para melhor qualidade
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0].message.content;
      if (responseContent) {
        const parsedContent = JSON.parse(responseContent);
        novasEtapas.push({
          ...tema,
          content: parsedContent.content,
          quiz: parsedContent.quiz,
        });
      }
      progressBar.increment();
    }

    progressBar.stop();
    console.log("Conteúdo gerado com sucesso!");

    // Cria a Seção 1 com as etapas geradas pela IA
    await SecaoModel.create({
      title: "Seção 1 - Fundamentos da Compreensão Textual",
      description: "Domine a base da leitura e interpretação!",
      order: 1,
      etapas: novasEtapas,
    });

    console.log("Banco de dados populado com o novo conteúdo!");

  } catch (error) {
    console.error("\nOcorreu um erro durante a geração:", error);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB Desconectado.");
  }
};

generateAndSeedContent();