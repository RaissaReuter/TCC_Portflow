// /src/routes/trilhaRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { getListaSecoes, getDetalheSecao } from '../controllers/trilhaController';

const router = Router();

// Rota para a tela principal da trilha (lista de seções)
// GET /api/trilha
router.get('/', protect, getListaSecoes);

// Rota para os detalhes de uma seção específica
// GET /api/trilha/secao/1
router.get('/secao/:secaoOrder', protect, getDetalheSecao);

export default router;