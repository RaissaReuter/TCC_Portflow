// ARQUIVO NOVO: backend/seedQuestoes.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QuestaoModel from './src/models/Questao'; // Importa nosso modelo de Questão

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Array com as questões de exemplo
const questoes = [
  {
    topico: 'Coerência',
    enunciado: 'Qual das frases a seguir apresenta um problema de coerência textual?',
    alternativas: [
      { letra: 'A', texto: 'Ele estudou muito para a prova, por isso foi reprovado.' },
      { letra: 'B', texto: 'Choveu muito ontem, então as ruas ficaram molhadas.' },
      { letra: 'C', texto: 'A menina gosta de sorvete de chocolate e de baunilha.' },
      { letra: 'D', texto: 'O sol nasceu, e o dia começou claro e ensolarado.' },
    ],
    respostaCorreta: 'A',
  },
  {
    topico: 'Coerência',
    enunciado: 'Marque a alternativa que completa o período de forma coerente: "Apesar de ter treinado intensamente, o atleta..."',
    imagemUrl: 'https://i.imgur.com/example.png', // URL de imagem de exemplo
    alternativas: [
      { letra: 'A', texto: '...venceu a competição com facilidade.' },
      { letra: 'B', texto: '...não conseguiu atingir o resultado esperado.' },
      { letra: 'C', texto: '...estava perfeitamente preparado para o desafio.' },
      { letra: 'D', texto: '...confirmou seu favoritismo e ganhou a medalha de ouro.' },
    ],
    respostaCorreta: 'B',
  },
  {
    topico: 'Crase',
    enunciado: 'Em qual das opções o uso do acento grave indicativo da crase está incorreto?',
    alternativas: [
      { letra: 'A', texto: 'Fui à farmácia comprar remédios.' },
      { letra: 'B', texto: 'Ele se referiu àquelas alunas com respeito.' },
      { letra: 'C', texto: 'O prêmio foi entregue à Felipe.' },
      { letra: 'D', texto: 'À noite, todos os gatos são pardos.' },
    ],
    respostaCorreta: 'C',
  },
  {
    topico: 'Crase',
    enunciado: 'Assinale a frase em que o "a" deve receber o acento grave da crase.',
    alternativas: [
      { letra: 'A', texto: 'Ele começou a falar em voz alta.' },
      { letra: 'B', texto: 'Esta é a casa a que me referi.' },
      { letra: 'C', texto: 'Voltei a pé para casa.' },
      { letra: 'D', texto: 'O navio chegou a tempo.' },
    ],
    respostaCorreta: 'B',
  },
  {
    topico: 'Figuras de Linguagem',
    enunciado: 'A frase "O bonde passa cheio de pernas: pernas brancas, pretas, amarelas." contém um exemplo de qual figura de linguagem?',
    alternativas: [
      { letra: 'A', texto: 'Metáfora' },
      { letra: 'B', texto: 'Metonímia' },
      { letra: 'C', texto: 'Hipérbole' },
      { letra: 'D', texto: 'Eufemismo' },
    ],
    respostaCorreta: 'B',
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI não encontrada no arquivo .env');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB conectado para o seeder...');

    // Deleta todas as questões existentes para evitar duplicatas
    await QuestaoModel.deleteMany({});
    console.log('Questões antigas deletadas...');

    // Insere as novas questões no banco de dados
    await QuestaoModel.insertMany(questoes);
    console.log('Novas questões inseridas com sucesso!');

  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    // Fecha a conexão com o banco de dados
    await mongoose.connection.close();
    console.log('Conexão com MongoDB fechada.');
  }
};

// Executa a função
seedDB();