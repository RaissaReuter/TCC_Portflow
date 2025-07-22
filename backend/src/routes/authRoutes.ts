import { Router } from 'express';
import { loginUser } from '../controllers/authController';

const router = Router();

// Rota para login de usuário
// POST /api/auth/login
router.post('/login', loginUser);

export default router;