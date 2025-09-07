// /backend/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SecaoModel from './src/models/Secao';

dotenv.config();

const secao1Data = {
  title: "Seção 1 - Fundamentos da Compreensão Textual",
  description: "Domine a base da leitura e interpretação!",
  order: 1,
  etapas: [
    { title: "Aula 1: Tipos Textuais", icon: "book", order: 1, content: "<h1>Aula 1: Tipos Textuais</h1><p>Nesta aula, vamos explorar os diferentes tipos textuais: narração, descrição, dissertação, exposição e injunção. Entender a finalidade de cada um é crucial para a prova do ENEM.</p>" },
    { title: "Aula 2: Gêneros Textuais", icon: "pencil", order: 2, content: "<h1>Aula 2: Gêneros Textuais</h1><p>Diferente dos tipos, os gêneros são as manifestações concretas dos textos no nosso dia a dia: uma notícia de jornal, uma receita de bolo, um e-mail. Vamos ver como identificá-los.</p>" },
    { title: "Aula 3: Coesão e Coerência", icon: "abc", order: 3, content: "<h1>Aula 3: Coesão e Coerência</h1><p>Estes são os pilares de um bom texto. Coesão são as 'costuras' gramaticais (conectivos, pronomes), enquanto coerência é a lógica e o sentido das ideias.</p>" },
    { title: "Exercício 1", icon: "repeat", order: 4, content: "Exercício em breve." },
    { title: "Aula 4: Inferência", icon: "undo", order: 5, content: "Conteúdo em breve." },
    { title: "Aula 5: Ambiguidade", icon: "info", order: 6, content: "Conteúdo em breve." },
    { title: "Simulado Final", icon: "flag", order: 7, content: "Conteúdo em breve." },
  ]
};

const seedDatabase = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error("MONGO_URI não encontrada no .env!");
    return;
  }
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB Conectado para seeding...");

    await SecaoModel.deleteMany({});
    console.log("Seções antigas removidas.");

    await SecaoModel.create(secao1Data);
    console.log("Seção 1 criada com sucesso!");

  } catch (error) {
    console.error("Erro no script de seed:", error);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB Desconectado.");
  }
};

seedDatabase();