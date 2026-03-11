import { Router } from 'express';
import * as chatbotController from '../controllers/chatbot.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All chatbot routes require authentication
router.use(authMiddleware());

// Chat endpoint
router.post('/chat', chatbotController.chat);

// Entity extraction
router.post('/extract-entities', chatbotController.extractEntities);

// Conversation management
router.get('/conversations', chatbotController.getUserConversations);
router.get('/conversations/:id', chatbotController.getConversation);

// Order draft management
router.get('/conversations/:conversationId/order-draft', chatbotController.getOrderDraft);
router.put('/conversations/:conversationId/order-draft', chatbotController.updateOrderDraft);

export default router;
