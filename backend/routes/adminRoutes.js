import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { verifyToken, verifyRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require token and admin role
router.use(verifyToken, verifyRole(['admin']));

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Review Management
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

// Booking Management
router.put('/bookings/:id/status', adminController.updateBookingStatus);

export default router;
