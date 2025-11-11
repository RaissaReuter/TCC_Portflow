"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /src/routes/dashboardRoutes.ts
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Rota protegida para buscar os dados do dashboard
// GET /api/dashboard
router.get('/', authMiddleware_1.protect, dashboardController_1.getDashboardData);
exports.default = router;
