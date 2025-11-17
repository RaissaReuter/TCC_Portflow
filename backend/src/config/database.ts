import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('--------------------------------------------------');
      console.error('ERRO FATAL: A variável de ambiente MONGO_URI não foi definida.');
      console.error('--------------------------------------------------');
      // Lançar um erro força o Node.js a parar de uma forma que os logs são geralmente capturados.
      throw new Error('MONGO_URI não definida.');
    }
    
    console.log('🚀 Tentando conectar ao MongoDB...');
    // Adicionamos um log para ver a URI que está sendo usada (sem a senha)
    // Isso ajuda a depurar se o nome do cluster ou usuário estão corretos.
    console.log(`🔗 Usando URI: ${mongoUri.replace(/:([^:]+)@/, ':*****@')}`);

    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Conectado com sucesso ao host: ${conn.connection.host}`);

  } catch (error) {
    console.error('--------------------------------------------------');
    console.error('❌ FALHA NA CONEXÃO COM O MONGODB:');
    if (error instanceof Error) {
      // Imprime a mensagem de erro específica do Mongoose
      console.error(`   Mensagem: ${error.message}`);
    } else {
      // Se não for um objeto de erro padrão, imprime o objeto inteiro
      console.error(error);
    }
    console.error('--------------------------------------------------');
    
    // Encerra o processo para que o deploy falhe e possamos ver o erro.
    process.exit(1); 
  }
};

export default connectDB;