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
    { title: "Aula 1: Tipos Textuais", icon: "book", order: 1 },
    { title: "Aula 2: Gêneros Textuais", icon: "pencil", order: 2 },
    { title: "Aula 3: Coesão e Coerência", icon: "abc", order: 3 },
    { title: "Exercício 1", icon: "repeat", order: 4 },
    { title: "Aula 4: Inferência", icon: "undo", order: 5 },
    { title: "Aula 5: Ambiguidade", icon: "info", order: 6 },
    { title: "Simulado Final", icon: "flag", order: 7 },
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