import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface para definir a estrutura de um documento de usuário
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Opcional, pois não queremos que retorne em todas as consultas
  role: 'aluno' | 'professor';
  comparePassword(password: string): Promise<boolean>;
}

// Schema do Mongoose
const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Garante que não teremos e-mails duplicados
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Por padrão, não inclui este campo nas buscas
  },
  role: {
    type: String,
    enum: ['aluno', 'professor'], // Garante que o papel seja um desses dois valores
    required: true,
  },
}, {
  timestamps: true, // Cria os campos createdAt e updatedAt automaticamente
});

// Middleware "pre-save": Executa ANTES de um usuário ser salvo no banco
UserSchema.pre<IUser>('save', async function (next) {
  // Se a senha não foi modificada, apenas continue
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  // Gera o hash da senha com um "custo" de 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar a senha fornecida com a senha no banco
UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  // 'this' refere-se ao documento do usuário
  return bcrypt.compare(password, this.password);
};

// Criando o Model
const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default UserModel;