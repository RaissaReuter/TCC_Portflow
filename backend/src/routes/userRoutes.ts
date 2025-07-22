import { Router } from 'express';
import { registerUser, getUserProfile } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';


const router = Router();

// Rota para registrar um novo usuário
// POST /api/users/register
router.post('/register', registerUser);

router.get('/profile', protect, getUserProfile);    

export default router;