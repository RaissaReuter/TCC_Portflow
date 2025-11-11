"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /src/routes/trilhaRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const trilhaController_1 = require("../controllers/trilhaController");
const router = (0, express_1.Router)();
// Rota para a tela principal da trilha (lista de seções)
// GET /api/trilha
router.get('/', authMiddleware_1.protect, trilhaController_1.getListaSecoes);
// Rota para os detalhes de uma seção específica
// GET /api/trilha/secao/1
// CORREÇÃO: Adicionando a rota que estava faltando
router.get('/secao/:secaoOrder', authMiddleware_1.protect, trilhaController_1.getDetalheSecao);
// Rota para os detalhes de uma etapa específica
// GET /api/trilha/secao/1/etapa/1
router.get('/secao/:secaoOrder/etapa/:etapaOrder', authMiddleware_1.protect, trilhaController_1.getDetalheEtapa);
// Rota para completar uma etapa
// POST /api/trilha/completar-etapa
router.post('/completar-etapa', authMiddleware_1.protect, trilhaController_1.completarEtapa);
exports.default = router;
