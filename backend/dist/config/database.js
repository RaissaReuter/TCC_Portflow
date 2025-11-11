"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        console.log('🔍 DEBUG: Verificando variáveis de ambiente...');
        console.log('MONGO_URI:', process.env.MONGO_URI ? 'DEFINIDA' : 'NÃO DEFINIDA');
        console.log('MONGO_USER:', process.env.MONGO_USER ? 'DEFINIDA' : 'NÃO DEFINIDA');
        console.log('MONGO_KEY:', process.env.MONGO_KEY ? 'DEFINIDA (****)' : 'NÃO DEFINIDA');
        console.log('MONGO_HOST:', process.env.MONGO_HOST || 'NÃO DEFINIDA (usando padrão)');
        console.log('MONGO_DATABASE:', process.env.MONGO_DATABASE || 'NÃO DEFINIDA (usando padrão)');
        let mongoURI = process.env.MONGO_URI;
        // Se MONGO_USER e MONGO_KEY estão definidos, construir a URI com autenticação
        if (process.env.MONGO_USER && process.env.MONGO_KEY) {
            const mongoUser = process.env.MONGO_USER;
            const mongoKey = process.env.MONGO_KEY;
            const mongoHost = process.env.MONGO_HOST || 'cluster0.pargnln.mongodb.net';
            const mongoDatabase = process.env.MONGO_DATABASE || '';
            const appName = process.env.MONGO_APP_NAME || 'Cluster0';
            mongoURI = `mongodb+srv://${mongoUser}:${mongoKey}@${mongoHost}/${mongoDatabase}?retryWrites=true&w=majority&appName=${appName}`;
            console.log('🔧 URI construída com variáveis de ambiente');
            console.log('🔗 Host usado:', mongoHost);
        }
        else {
            console.log('🔧 Usando MONGO_URI direta');
        }
        if (!mongoURI) {
            console.error('❌ MongoDB connection string is not properly configured. Please set MONGO_URI or MONGO_USER/MONGO_KEY in .env file');
            process.exit(1);
        }
        console.log('🚀 Tentando conectar ao MongoDB...');
        await mongoose_1.default.connect(mongoURI);
        console.log('✅ MongoDB Connected successfully!');
    }
    catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('📋 Full error details:', err);
        // Exit process with failure
        process.exit(1);
    }
};
exports.default = connectDB;
