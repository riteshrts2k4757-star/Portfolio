import express from 'express';
import { register, login, forgotPassword, uploadProfilePicture, updateProfile, getStats, saveGameResult } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { findUserById } from '../models/userModel.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/profile-picture', verifyToken, uploadProfilePicture);
router.put('/profile', verifyToken, updateProfile);
router.get('/game-stats', verifyToken, getStats);
router.post('/game-stats', verifyToken, saveGameResult);

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ 
      message: 'Access granted', 
      user: user 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
