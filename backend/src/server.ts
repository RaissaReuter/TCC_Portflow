import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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