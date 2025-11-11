"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /src/routes/redacaoRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const redacaoController_1 = require("../controllers/redacaoController");
const router = (0, express_1.Router)();
// Rota: POST /api/redacao/analisar
// Esta linha conecta a URL ao nosso controller.
router.post('/analisar', authMiddleware_1.protect, redacaoController_1.analisarRedacao);
exports.default = router;
