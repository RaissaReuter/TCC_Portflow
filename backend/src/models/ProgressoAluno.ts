// /src/models/ProgressoAluno.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgressoAluno extends Document {
  alunoId: mongoose.Schema.Types.ObjectId;
  secaoAtual: number; // Ordem da Seção atual (1, 2, 3...)
  etapaAtual: number; // Ordem da Etapa atual dentro da Seção
  etapasConcluidas: { secao: number; etapa: number }[];
}

const ProgressoAlunoSchema: Schema<IProgressoAluno> = new Schema({
  alunoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  secaoAtual: { type: Number, default: 1 },
  etapaAtual: { type: Number, default: 1 },
  etapasConcluidas: [{
    secao: Number,
    etapa: Number,
  }],
}, { timestamps: true });

const ProgressoAlunoModel: Model<IProgressoAluno> = mongoose.model<IProgressoAluno>('ProgressoAluno', ProgressoAlunoSchema);
export default ProgressoAlunoModel;