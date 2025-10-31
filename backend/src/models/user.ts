import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// --- INTERFACE CORRIGIDA ---
// Garante que o TypeScript saiba que 'googleId' e 'password' podem existir (e ser opcionais).
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'aluno' | 'professor';
  googleId?: string;
  comparePassword(password: string): Promise<boolean>;
}

// --- SCHEMA CORRIGIDO ---
const UserSchema: Schema<IUser> = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    // Regex para validar o formato do email
    match: [/.+\@.+\..+/, 'Por favor, insira um email válido.']
  },
  password: { 
    type: String, 
    // A senha não é obrigatória, permitindo o cadastro com Google
    required: false, 
    // Não retorna a senha em consultas por padrão
    select: false 
  },
  role: { 
    type: String, 
    enum: ['aluno', 'professor'], 
    default: 'aluno' 
  },
  googleId: { 
    type: String, 
    required: false, 
    unique: true,
    // 'sparse' otimiza a indexação de campos únicos que podem ser nulos
    sparse: true 
  },
}, { timestamps: true });


// --- MÉTODOS DO SCHEMA (MANTIDOS) ---

// Middleware (hook) para criptografar a senha ANTES de salvar o usuário
UserSchema.pre<IUser>('save', async function (next) {
  // Roda esta função apenas se a senha foi modificada (ou é nova)
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    // Se ocorrer um erro, passamos para o próximo middleware
    // O TypeScript pode reclamar do tipo de 'error', então podemos ser explícitos
    if (error instanceof Error) {
      return next(error);
    }
    return next(new Error('Erro ao criptografar a senha.'));
  }
});

// Método para comparar a senha fornecida com a senha no banco
UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  // 'this.password' não estará disponível aqui a menos que usemos .select('+password') na consulta
  if (!this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(password, this.password);
};


const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default UserModel;