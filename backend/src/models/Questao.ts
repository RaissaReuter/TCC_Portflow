// ARQUIVO NOVO: backend/src/models/Questao.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IAlternativa {
  letra: string; // 'A', 'B', 'C', 'D', 'E'
  texto: string;
}

export interface IQuestao extends Document {
  topico: string; // Ex: "Coerência", "Crase", "Figuras de Linguagem"
  enunciado: string;
  imagemUrl?: string; // URL para uma imagem, opcional
  alternativas: IAlternativa[];
  respostaCorreta: string; // A letra da alternativa correta, ex: 'C'
}

const AlternativaSchema: Schema = new Schema({
  letra: { type: String, required: true },
  texto: { type: String, required: true },
}, { _id: false }); // _id: false para não criar IDs para as sub-alternativas

const QuestaoSchema: Schema = new Schema({
  topico: {
    type: String,
    required: true,
    index: true, // Adiciona um índice para buscar questões por tópico mais rápido
  },
  enunciado: {
    type: String,
    required: true,
  },
  imagemUrl: {
    type: String,
  },
  alternativas: {
    type: [AlternativaSchema],
    required: true,
    validate: [
      (val: IAlternativa[]) => val.length > 1, 
      'A questão deve ter pelo menos duas alternativas.'
    ]
  },
  respostaCorreta: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IQuestao>('Questao', QuestaoSchema);