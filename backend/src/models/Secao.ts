// /src/models/Secao.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface para uma única Etapa dentro da Seção
export interface IEtapa extends Document {
  title: string;
  icon: string; // Nome do ícone (ex: 'book', 'pencil')
  order: number;
}

const EtapaSchema: Schema<IEtapa> = new Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, required: true },
});

// Interface para a Seção principal
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
  etapas: [EtapaSchema], // Array de subdocumentos de Etapas
}, { timestamps: true });

const SecaoModel: Model<ISecao> = mongoose.model<ISecao>('Secao', SecaoSchema);
export default SecaoModel;