import express from 'express';
import rateLimit from 'express-rate-limit';
import { submitContactForm } from '../controllers/contactController.js';

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 emails per hour
  message: { error: 'Too many messages sent from this IP, please try again after an hour.' }
});

router.post('/', contactLimiter, submitContactForm);

export default router;
