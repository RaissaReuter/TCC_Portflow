import { Router } from 'express';
import { loginUser, googleLogin, getMe } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

export default router;