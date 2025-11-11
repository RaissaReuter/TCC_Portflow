"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ProgressoAlunoSchema = new mongoose_1.Schema({
    alunoId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    respostas: [{
            questaoId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Questao' },
            acertou: { type: Boolean },
            _id: false
        }],
    pontuacao: { type: Number, default: 0 },
    // --- 2. NOVO CAMPO ADICIONADO AO SCHEMA ---
    // Representa o índice da questão que o aluno está visualizando.
    questaoAtual: { type: Number, default: 0 },
}, { _id: false });
const SessaoSchema = new mongoose_1.Schema({
    nome: { type: String, required: true },
    topico: { type: String, required: true },
    professor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    codigo: { type: String, required: true, unique: true, index: true },
    status: {
        type: String,
        enum: ['AGUARDANDO', 'EM_ANDAMENTO', 'FINALIZADA'],
        default: 'AGUARDANDO',
    },
    questoes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Questao' }],
    configuracao: {
        duracaoMinutos: { type: Number, required: true },
        habilitarPomodoro: { type: Boolean, default: false },
    },
    participantes: [ProgressoAlunoSchema],
    tempoInicio: { type: Date },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('SessaoSala', SessaoSchema);
