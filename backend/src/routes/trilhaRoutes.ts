// /src/routes/trilhaRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { getListaSecoes, getDetalheSecao, getDetalheEtapa, completarEtapa} from '../controllers/trilhaController';

const router = Router();

// Rota para a tela principal da trilha (lista de seções)
// GET /api/trilha
router.get('/', protect, getListaSecoes);

// Rota para os detalhes de uma seção específica
// GET /api/trilha/secao/1
// CORREÇÃO: Adicionando a rota que estava faltando
router.get('/secao/:secaoOrder', protect, getDetalheSecao);

// Rota para os detalhes de uma etapa específica
// GET /api/trilha/secao/1/etapa/1
router.get('/secao/:secaoOrder/etapa/:etapaOrder', protect, getDetalheEtapa); 

// Rota para completar uma etapa
// POST /api/trilha/completar-etapa
router.post('/completar-etapa', protect, completarEtapa); 

export default router;