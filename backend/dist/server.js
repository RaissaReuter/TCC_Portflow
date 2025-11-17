"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("./config/database"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const chatbotRoutes_1 = __importDefault(require("./routes/chatbotRoutes"));
const redacaoRoutes_1 = __importDefault(require("./routes/redacaoRoutes"));
const trilhaRoutes_1 = __importDefault(require("./routes/trilhaRoutes"));
const turmaRoutes_1 = __importDefault(require("./routes/turmaRoutes"));
const sessaoSalaRoutes_1 = __importDefault(require("./routes/sessaoSalaRoutes"));
dotenv_1.default.config();
(0, database_1.default)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// --- CONFIGURAÇÃO DE CORS SIMPLIFICADA PARA PRODUÇÃO ---
app.use((0, cors_1.default)({
    origin: true, // Permite qualquer origem em produção (mesmo domínio)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// --- FIM DA CORREÇÃO ---
app.use(express_1.default.json());
app.use('/api/users', userRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/chatbot', chatbotRoutes_1.default);
app.use('/api/redacao', redacaoRoutes_1.default);
app.use('/api/trilha', trilhaRoutes_1.default);
app.use('/api/turmas', turmaRoutes_1.default);
app.use('/api/sessoes-sala', sessaoSalaRoutes_1.default);
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
    const frontendOutPath = path_1.default.join(__dirname, '../../frontend/out');
    // Servir arquivos estáticos do frontend
    app.use(express_1.default.static(frontendOutPath));
    // Middleware para servir o index.html para rotas não-API
    app.use((req, res, next) => {
        // Se a rota começar com /api, continua para próximo middleware
        if (req.path.startsWith('/api')) {
            return next();
        }
        // Para todas as outras rotas, serve o index.html
        const indexPath = path_1.default.join(frontendOutPath, 'index.html');
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
