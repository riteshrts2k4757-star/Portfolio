import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getChatUsers, getMessages, markMessagesRead, sendMessage } from '../controllers/chatController.js';

const router = express.Router();

// All chat routes require authentication
router.use(verifyToken);

router.get('/users', getChatUsers);
router.get('/messages/:userId', getMessages);
router.patch('/messages/:userId/read', markMessagesRead);
router.post('/messages', sendMessage);

export default router;
