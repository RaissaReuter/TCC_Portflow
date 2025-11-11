import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user';
import { IQuestao } from './Questao';

// Define os possíveis estados de uma sessão
type StatusSessao = 'AGUARDANDO' | 'EM_ANDAMENTO' | 'FINALIZADA';

// Interface para guardar o progresso de cada aluno na sessão
export interface IProgressoAlunoNaSessao {
  alunoId: IUser['_id'];
  respostas: {
    questaoId: IQuestao['_id'];
    acertou: boolean;
  }[];
  pontuacao: number;
  questaoAtual: number; // <-- 1. NOVO CAMPO ADICIONADO À INTERFACE
}

export interface ISessao extends Document {
  nome: string;
  topico: string;
  professor: IUser['_id'];
  codigo: string;
  status: StatusSessao;
  questoes: IQuestao['_id'][];
  configuracao: {
    duracaoMinutos: number;
    habilitarPomodoro: boolean;
  };
  participantes: IProgressoAlunoNaSessao[];
  tempoInicio?: Date; // O momento em que o professor clica em "Iniciar"
}

const ProgressoAlunoSchema: Schema = new Schema({
  alunoId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  respostas: [{
    questaoId: { type: Schema.Types.ObjectId, ref: 'Questao' },
    acertou: { type: Boolean },
    _id: false
  }],
  pontuacao: { type: Number, default: 0 },
  // --- 2. NOVO CAMPO ADICIONADO AO SCHEMA ---
  // Representa o índice da questão que o aluno está visualizando.
  questaoAtual: { type: Number, default: 0 }, 
}, { _id: false });

const SessaoSchema: Schema = new Schema({
  nome: { type: String, required: true },
  topico: { type: String, required: true },
  professor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  codigo: { type: String, required: true, unique: true, index: true },
  status: {
    type: String,
    enum: ['AGUARDANDO', 'EM_ANDAMENTO', 'FINALIZADA'],
    default: 'AGUARDANDO',
  },
  questoes: [{ type: Schema.Types.ObjectId, ref: 'Questao' }],
  configuracao: {
    duracaoMinutos: { type: Number, required: true },
    habilitarPomodoro: { type: Boolean, default: false },
  },
  participantes: [ProgressoAlunoSchema],
  tempoInicio: { type: Date },
}, {
  timestamps: true,
});

export default mongoose.model<ISessao>('SessaoSala', SessaoSchema);