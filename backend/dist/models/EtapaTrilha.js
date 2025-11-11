"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const QuizQuestionSchema = new mongoose_1.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
});
const EtapaTrilhaSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    icon: { type: String, required: true },
    order: { type: Number, required: true },
    content: { type: String, required: true, default: 'Conteúdo em breve.' },
    quiz: [QuizQuestionSchema], // <-- NOVO CAMPO
});
const EtapaSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    icon: { type: String, required: true },
    order: { type: Number, required: true },
    content: { type: String, required: true, default: 'Conteúdo em breve.' }, // <-- NOVO CAMPO
});
