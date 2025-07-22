// /src/routes/chatbotRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { handleChatMessage } from '../controllers/chatbotController';

const router = Router();

// Rota: POST /api/chatbot
router.post('/', protect, handleChatMessage);

export default router;