// ARQUIVO NOVO: backend/src/routes/turmaRoutes.ts

import { Router } from 'express';
import { criarTurma } from '../controllers/turmaController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Rota para criar uma nova turma
// POST /api/turmas
// A rota é protegida, ou seja, o usuário precisa estar logado.
// O middleware 'protect' também garante que 'req.user' estará disponível.
router.post('/', protect, criarTurma);

export default router;