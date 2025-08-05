// /src/routes/redacaoRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { analisarRedacao } from '../controllers/redacaoController';

const router = Router();

// Rota: POST /api/redacao/analisar
// Esta linha conecta a URL ao nosso controller.
router.post('/analisar', protect, analisarRedacao);

export default router;