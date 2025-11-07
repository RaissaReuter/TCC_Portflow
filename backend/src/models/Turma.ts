// ARQUIVO NOVO: backend/src/models/Turma.ts

import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user'; // Importamos a interface de Usuário para referência

// Interface que define as propriedades de uma Turma
export interface ITurma extends Document {
  nome: string;
  professor: IUser['_id']; // Referência ao ID do professor (um usuário)
  alunos: IUser['_id'][];   // Uma lista de referências aos IDs dos alunos
  codigo: string;          // Código único para entrar na turma
}

const TurmaSchema: Schema = new Schema({
  nome: {
    type: String,
    required: [true, 'O nome da turma é obrigatório.'],
    trim: true,
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Isso cria uma referência ao nosso modelo 'User'
  },
  alunos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Cada item na lista também é uma referência a um 'User'
  }],
  codigo: {
    type: String,
    required: true,
    unique: true, // Garante que não haverá duas turmas com o mesmo código
  },
}, {
  timestamps: true, // Adiciona os campos createdAt e updatedAt automaticamente
});

export default mongoose.model<ITurma>('Turma', TurmaSchema);