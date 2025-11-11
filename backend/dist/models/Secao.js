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
// --- SCHEMAS MONGOOSE ---
// Definem as regras de validação para o banco de dados
const QuizQuestionSchema = new mongoose_1.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
    explanation: { type: String, required: true }
});
const EnemExampleSchema = new mongoose_1.Schema({
    source: { type: String, required: true },
    supportText: { type: String, default: '' },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
});
const EtapaSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    icon: { type: String, required: true },
    order: { type: Number, required: true },
    content: { type: mongoose_1.Schema.Types.Mixed, required: true, default: {} },
    quiz: { type: [QuizQuestionSchema], default: [] },
    enem_explanation: { type: String, default: '' },
    enem_example: { type: EnemExampleSchema },
});
const SecaoSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true, unique: true },
    etapas: [EtapaSchema],
}, { timestamps: true });
const SecaoModel = mongoose_1.default.model('Secao', SecaoSchema);
exports.default = SecaoModel;
