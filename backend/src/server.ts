import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database'; // <-- 1. Importar
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';   
import dashboardRoutes from './routes/dashboardRoutes';
import chatbotRoutes from './routes/chatbotRoutes';

dotenv.config();
connectDB(); // <-- 2. Chamar a função de conexão

const app = express();
const PORT = process.env.PORT || 3001;

// ... o resto do seu código server.ts permanece o mesmo
// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes); // <-- 3. Adicionar rota do chatbot

// Rota de Teste de Saúde
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PortFlow API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});