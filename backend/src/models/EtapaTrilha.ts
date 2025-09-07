import mongoose, { Schema, Document, Model } from 'mongoose';

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
// ...