import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface para uma única questão do quiz
interface IQuizQuestion extends Document {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

const QuizQuestionSchema: Schema<IQuizQuestion> = new Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
});

// Interface para a Etapa principal
export interface IEtapa extends Document {
  title: string;
  icon: string;
  order: number;
  content: string;
  quiz: IQuizQuestion[]; // <-- NOVO CAMPO
}

const EtapaTrilhaSchema: Schema<IEtapa> = new Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, required: true },
  content: { type: String, required: true, default: 'Conteúdo em breve.' },
  quiz: [QuizQuestionSchema], // <-- NOVO CAMPO
});

export interface IEtapa extends Document {
  title: string;
  icon: string;
  order: number;
  content: string; // <-- NOVO CAMPO
}

const EtapaSchema: Schema<IEtapa> = new Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, required: true },
  content: { type: String, required: true, default: 'Conteúdo em breve.' }, // <-- NOVO CAMPO
});
