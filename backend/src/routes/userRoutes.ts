import { Router } from 'express';
import { registerUser, getUserProfile, setUserRole } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerUser);

router.get('/profile', protect, getUserProfile);

router.post('/set-role', protect, setUserRole);

export default router;