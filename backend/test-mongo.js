const mongoose = require('mongoose');
require('dotenv').config();

console.log('=== TESTE DE CONEXÃO MONGODB ===');
console.log('Variáveis de ambiente carregadas:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('MONGO_USER:', process.env.MONGO_USER ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('MONGO_KEY:', process.env.MONGO_KEY ? 'DEFINIDA (****)' : 'NÃO DEFINIDA');
console.log('MONGO_HOST:', process.env.MONGO_HOST || 'NÃO DEFINIDA');
console.log('MONGO_DATABASE:', process.env.MONGO_DATABASE || 'NÃO DEFINIDA');
console.log('MONGO_APP_NAME:', process.env.MONGO_APP_NAME || 'NÃO DEFINIDA');

const testConnection = async () => {
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
      console.log('\n=== URI CONSTRUÍDA ===');
      console.log('URI completa:', mongoURI.replace(mongoKey, '****'));
    }
    
    if (!mongoURI) {
      console.error('❌ ERRO: Nenhuma URI do MongoDB configurada!');
      process.exit(1);
    }

    console.log('\n=== TENTANDO CONECTAR ===');
    console.log('Conectando ao MongoDB...');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 segundos timeout
    });
    
    console.log('✅ SUCESSO: MongoDB conectado com sucesso!');
    
    // Teste básico de operação
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Collections disponíveis:', collections.length);
    
    await mongoose.disconnect();
    console.log('🔌 Conexão fechada com sucesso');
    
  } catch (err) {
    console.error('❌ ERRO DE CONEXÃO:', err.message);
    console.error('Detalhes do erro:', err);
    process.exit(1);
  }
};

testConnection();
