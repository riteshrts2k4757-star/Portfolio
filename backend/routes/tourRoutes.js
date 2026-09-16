import express from 'express';
import * as tourController from '../controllers/tourController.js';
import { verifyToken, verifyRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', tourController.getTours);
router.get('/:id', tourController.getTourDetails);

// Protected routes (User)
router.post('/bookings', verifyToken, tourController.createBooking);
router.get('/bookings/my-bookings', verifyToken, tourController.getUserBookings);
router.get('/bookings/:id', verifyToken, tourController.getBookingDetails);
router.post('/bookings/:id/pay', tourController.confirmDummyPayment);
router.post('/reviews', verifyToken, tourController.createReview);

// Guide / Admin specific routes
router.get('/guide/my-tours', verifyToken, verifyRole(['tourguide', 'admin']), tourController.getMyTours);
router.get('/admin/bookings', verifyToken, verifyRole(['tourguide', 'admin']), tourController.getAllBookings);

// Admin & Guide Tour Management
router.post('/', verifyToken, verifyRole(['tourguide', 'admin']), tourController.createTour);
router.put('/:id', verifyToken, verifyRole(['tourguide', 'admin']), tourController.updateTour);
router.delete('/:id', verifyToken, verifyRole(['tourguide', 'admin']), tourController.deleteTour);

export default router;
