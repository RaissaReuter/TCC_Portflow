"use strict";
// ARQUIVO NOVO: backend/src/routes/turmaRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const turmaController_1 = require("../controllers/turmaController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Rota para criar uma nova turma
// POST /api/turmas
// A rota é protegida, ou seja, o usuário precisa estar logado.
// O middleware 'protect' também garante que 'req.user' estará disponível.
router.post('/', authMiddleware_1.protect, turmaController_1.criarTurma);
exports.default = router;
