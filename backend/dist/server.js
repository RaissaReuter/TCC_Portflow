"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
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
// --- CONFIGURAÇÃO DE CORS CORRIGIDA ---
// Lista de origens que têm permissão para acessar a API
const allowedOrigins = [
    'http://localhost:3000', // Frontend em desenvolvimento
    // Quando você fizer o deploy do frontend, adicionará a URL da Netlify/Vercel aqui
];
const corsOptions = {
    origin: (origin, callback) => {
        // Permite requisições sem 'origin' (ex: Postman) ou se a origem está na lista
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Não permitido pela política de CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use((0, cors_1.default)(corsOptions));
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
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
