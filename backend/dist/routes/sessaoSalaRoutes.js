"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessaoSalaController_1 = require("../controllers/sessaoSalaController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Rota para um professor criar uma nova sessão de estudo
// POST /api/sessoes-sala
router.post('/', authMiddleware_1.protect, sessaoSalaController_1.criarSessao);
// Rota para um aluno entrar em uma sessão
// POST /api/sessoes-sala/entrar
router.post('/entrar', authMiddleware_1.protect, sessaoSalaController_1.entrarNaSessao);
// Rota para buscar o estado atual de uma sessão (para polling)
// GET /api/sessoes-sala/:id
router.get('/:id', authMiddleware_1.protect, sessaoSalaController_1.getStatusSessao);
router.post('/:id/iniciar', authMiddleware_1.protect, sessaoSalaController_1.iniciarSessao);
router.post('/responder', authMiddleware_1.protect, sessaoSalaController_1.responderQuestao);
router.post('/:id/finalizar', authMiddleware_1.protect, sessaoSalaController_1.finalizarSessao);
exports.default = router;
