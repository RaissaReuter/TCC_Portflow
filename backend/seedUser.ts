import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import UserModel from './src/models/user';

dotenv.config();

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;
    
    // Se MONGO_USER e MONGO_KEY estão definidos, construir a URI com autenticação
    if (process.env.MONGO_USER && process.env.MONGO_KEY) {
      const mongoUser = process.env.MONGO_USER;
      const mongoKey = process.env.MONGO_KEY;
      const mongoHost = process.env.MONGO_HOST || 'cluster0.pargnln.mongodb.net';
      const mongoDatabase = process.env.MONGO_DATABASE || '';
      const appName = process.env.MONGO_APP_NAME || 'Cluster0';
      
      mongoURI = `mongodb+srv://${mongoUser}:${mongoKey}@${mongoHost}/${mongoDatabase}?retryWrites=true&w=majority&appName=${appName}`;
    }
    
    if (!mongoURI) {
      console.error('❌ MongoDB connection string is not properly configured');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected for seeding...');
  } catch (err: any) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const createUser = async () => {
  try {
    await connectDB();

    // Dados do usuário - Raissa Reuter
    const userData = {
      name: 'Raissa Reuter',
      email: 'raissa@exemplo.com',
      password: 'raissa_2025', // Será hasheada automaticamente
      role: 'aluno' as const
    };

    // Verificar se o usuário já existe
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      console.log('⚠️  Usuário já existe:', userData.email);
      process.exit(0);
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Criar usuário
    const newUser = new UserModel({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newUser.save();

    console.log('🎉 Usuário criado com sucesso!');
    console.log('📧 Email:', userData.email);
    console.log('🔑 Senha:', userData.password);
    console.log('👤 Role:', userData.role);
    console.log('🆔 ID:', newUser._id);

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar
createUser();
