"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /src/routes/chatbotRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const chatbotController_1 = require("../controllers/chatbotController");
const router = (0, express_1.Router)();
// Rota: POST /api/chatbot
router.post('/', authMiddleware_1.protect, chatbotController_1.handleChatMessage);
exports.default = router;
