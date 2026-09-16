import express from 'express';
import { handleAiChat } from '../controllers/aiController.js';

const router = express.Router();

// Optional: you can require authentication for AI chat by adding `authenticate` middleware
// router.post('/', authenticate, handleAiChat);
router.post('/', handleAiChat);

export default router;
