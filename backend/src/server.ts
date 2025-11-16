import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';   
import dasimport express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';   
import dashboardRoutes from './routes/dashboardRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import redacaoRoutes from './routes/redacaoRoutes';
import trilhaRoutes from './routes/trilhaRoutes';
import turmaaRoutes from './routes/turmaRoutes';
import sessaoSalaRoutes from './routes/sessaoSalaRoutes';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// --- CONFIGURAÇÃO DE CORS PARA ARQUITETURA SEPARADA ---
const allowedOrigins = [
  'http://localhost:3000', // Frontend em desenvolvimento local
  'https://portflow-git-final-raissareuters-projects.vercel.app', // URL principal da Vercel
  'https://tcc-portflow-phg6.onrender.com' // URL do frontend que seu primo usou
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
// --- FIM DA CONFIGURAÇÃO DE CORS ---

app.use(express.json());

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/redacao', redacaoRoutes);
app.use('/api/trilha', trilhaRoutes);
app.use('/api/turmas', turmaaRoutes);
app.use('/api/sessoes-sala', sessaoSalaRoutes);

// Rota de Teste de Saúde
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PortFlow API is running!' });
});

// O bloco para servir arquivos estáticos foi REMOVIDO.

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});hboardRoutes from './routes/dashboardRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import redacaoRoutes from './routes/redacaoRoutes';
import trilhaRoutes from './routes/trilhaRoutes';
import turmaaRoutes from './routes/turmaRoutes';
import sessaoSalaRoutes from './routes/sessaoSalaRoutes';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// --- CONFIGURAÇÃO DE CORS SIMPLIFICADA PARA PRODUÇÃO ---
app.use(cors({
  origin: true, // Permite qualquer origem em produção (mesmo domínio)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// --- FIM DA CORREÇÃO ---

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/redacao', redacaoRoutes);
app.use('/api/trilha', trilhaRoutes);
app.use('/api/turmas', turmaaRoutes);
app.use('/api/sessoes-sala', sessaoSalaRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PortFlow API is running!' });
});

app.get('/api/debug', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    env_check: {
      JWT_SECRET: process.env.JWT_SECRET ? 'DEFINIDO' : 'NÃO DEFINIDO',
      MONGO_USER: process.env.MONGO_USER ? 'DEFINIDO' : 'NÃO DEFINIDO',
      MONGO_KEY: process.env.MONGO_KEY ? 'DEFINIDO' : 'NÃO DEFINIDO',
      NODE_ENV: process.env.NODE_ENV || 'NÃO DEFINIDO'
    }
  });
});

// --- SERVIR ARQUIVOS ESTÁTICOS DO FRONTEND ---
if (process.env.NODE_ENV === 'production') {
  // Servir arquivos estáticos do Next.js
  const frontendOutPath = path.join(__dirname, '../../frontend/out');
  
  // Servir arquivos estáticos do frontend
  app.use(express.static(frontendOutPath));
  
  // Middleware para servir o index.html para rotas não-API
  app.use((req, res, next) => {
    // Se a rota começar com /api, continua para próximo middleware
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Para todas as outras rotas, serve o index.html
    const indexPath = path.join(frontendOutPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Erro ao servir frontend:', err);
        res.status(404).json({ error: 'Page not found' });
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('📱 Frontend sendo servido na mesma porta');
  }
});