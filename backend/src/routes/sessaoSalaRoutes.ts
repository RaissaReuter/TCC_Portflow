import { Router } from 'express';
import { criarSessao, entrarNaSessao, getStatusSessao, iniciarSessao, responderQuestao } from '../controllers/sessaoSalaController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();
// Rota para um professor criar uma nova sessão de estudo
// POST /api/sessoes-sala
router.post('/', protect, criarSessao);

// Rota para um aluno entrar em uma sessão
// POST /api/sessoes-sala/entrar
router.post('/entrar', protect, entrarNaSessao);

// Rota para buscar o estado atual de uma sessão (para polling)
// GET /api/sessoes-sala/:id
router.get('/:id', protect, getStatusSessao);

router.post('/:id/iniciar', protect, iniciarSessao);

router.post('/responder', protect, responderQuestao);

export default router;