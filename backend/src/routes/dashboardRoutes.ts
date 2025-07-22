// /src/routes/dashboardRoutes.ts
import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Rota protegida para buscar os dados do dashboard
// GET /api/dashboard
router.get('/', protect, getDashboardData);

export default router;