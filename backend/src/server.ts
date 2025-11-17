import express from 'express';
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

console.log(">>> [PASSO 1] Iniciando o servidor...");

dotenv.config();
console.log(">>> [PASSO 2] Variáveis de ambiente (.env) carregadas.");

connectDB();
console.log(">>> [PASSO 3] Chamada para conectar ao banco de dados realizada.");

const app = express();
const PORT = process.env.PORT || 3001;

// --- CONFIGURAÇÃO DE CORS PARA ARQUITETURA SEPARADA ---
const allowedOrigins = [
  'http://localhost:3000', // Frontend em desenvolvimento local
  'https://portflow-git-final-raissareuters-projects.vercel.app', // URL principal da Vercel
  'https://tcc-portflow-phg6.onrender.com' // URL do frontend que seu primo usou
  // Adicione aqui a URL final do seu frontend quando tiver
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

app.use(cors());
app.use(express.json());

console.log(">>> [PASSO 4] Middlewares (cors, json) configurados.");

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

// O bloco if (process.env.NODE_ENV === 'production') FOI REMOVIDO

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});