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

const app = express();
const PORT = process.env.PORT || 3001;

// --- CONFIGURAÇÃO DE CORS PARA ARQUITETURA SEPARADA ---
// Lista de origens que podem acessar a API
const allowedOrigins = [
  'http://localhost:3000', // Frontend em desenvolvimento local
  'https://tcc-portflow-phg6.onrender.com', // URL do seu frontend na Vercel
  // Adicione aqui outras URLs da Vercel se houver (ex: branches de preview)
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
app.options('*', cors(corsOptions)); // Habilita o pre-flight para todas as rotas
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

// O BLOCO DE CÓDIGO PARA SERVIR ARQUIVOS ESTÁTICOS FOI REMOVIDO DAQUI

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});