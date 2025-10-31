import mongoose, { Schema, Document, Model } from 'mongoose';

// --- INTERFACES DE DADOS "PURAS" ---
// Representam os objetos JSON que a IA gera

export interface IQuizQuestionData {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface IEnemExampleData {
  source: string;
  supportText?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface IEtapaData {
  title: string;
  icon: string;
  order: number;
  content: Record<string, any>; // Teoria como objeto estruturado
  quiz: IQuizQuestionData[];
  enem_explanation: string;
  enem_example?: IEnemExampleData; // Exemplo ENEM como objeto
}

// --- INTERFACES DE DOCUMENTO MONGOOSE ---
// Representam os documentos no banco de dados

export interface IQuizQuestion extends IQuizQuestionData, Document {}
export interface IEnemExample extends IEnemExampleData, Document {}
export interface IEtapa extends IEtapaData, Document {
  quiz: IQuizQuestion[];
  enem_example?: IEnemExample;
}

// --- SCHEMAS MONGOOSE ---
// Definem as regras de validação para o banco de dados

const QuizQuestionSchema: Schema<IQuizQuestion> = new Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String, required: true }
});

const EnemExampleSchema: Schema<IEnemExample> = new Schema({
  source: { type: String, required: true },
  supportText: { type: String, default: '' },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const EtapaSchema: Schema<IEtapa> = new Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, required: true },
  content: { type: Schema.Types.Mixed, required: true, default: {} },
  quiz: { type: [QuizQuestionSchema], default: [] },
  enem_explanation: { type: String, default: '' },
  enem_example: { type: EnemExampleSchema },
});

export interface ISecao extends Document {
  title: string;
  description: string;
  order: number;
  etapas: IEtapa[];
}

const SecaoSchema: Schema<ISecao> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true, unique: true },
  etapas: [EtapaSchema],
}, { timestamps: true });

const SecaoModel: Model<ISecao> = mongoose.model<ISecao>('Secao', SecaoSchema);
export default SecaoModel;