import * as tourModel from '../models/tourModel.js';
import crypto from 'crypto';

// --- TOURS ---

export const getTours = async (req, res) => {
  try {
    const filters = req.query;
    const tours = await tourModel.getAllTours(filters);
    res.status(200).json({ tours });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
};

export const getTourDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await tourModel.getTourById(id);
    if (!tour) return res.status(404).json({ error: 'Tour not found' });
    
    // Also fetch reviews
    const reviews = await tourModel.getTourReviews(id);
    
    res.status(200).json({ tour, reviews });
  } catch (error) {
    console.error('Error fetching tour details:', error);
    res.status(500).json({ error: 'Failed to fetch tour details' });
  }
};

export const createTour = async (req, res) => {
  try {
    // Only admin or guide can create tours. Middleware handles authorization.
    const tourData = req.body;
    
    // Assign to current guide if it's a guide creating it
    if (req.user.role === 'tourguide' && !tourData.tour_guide_id) {
      tourData.tour_guide_id = req.user.id;
    }
    
    const newTour = await tourModel.createTour(tourData);
    res.status(201).json({ message: 'Tour created successfully', tour: newTour });
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ error: 'Failed to create tour' });
  }
};

export const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tourData = req.body;
    
    // Verify ownership if tourguide
    if (req.user.role === 'tourguide') {
      const existing = await tourModel.getTourById(id);
      if (!existing || existing.tour_guide_id !== req.user.id) {
        return res.status(403).json({ error: 'You do not have permission to update this tour' });
      }
    }

    const updatedTour = await tourModel.updateTour(id, tourData);
    res.status(200).json({ message: 'Tour updated successfully', tour: updatedTour });
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: 'Failed to update tour' });
  }
};

export const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership if tourguide
    if (req.user.role === 'tourguide') {
      const existing = await tourModel.getTourById(id);
      if (!existing || existing.tour_guide_id !== req.user.id) {
        return res.status(403).json({ error: 'You do not have permission to delete this tour' });
      }
    }

    await tourModel.deleteTour(id);
    res.status(200).json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: 'Failed to delete tour' });
  }
};

export const getMyTours = async (req, res) => {
  try {
    if (req.user.role === 'tourguide') {
      const tours = await tourModel.getToursByGuide(req.user.id);
      res.status(200).json({ tours });
    } else if (req.user.role === 'admin') {
      const tours = await tourModel.getAllTours({}); // Admins see all without active filter
      res.status(200).json({ tours });
    } else {
      res.status(403).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Error fetching guide tours:', error);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
};

// --- BOOKINGS ---

export const createBooking = async (req, res) => {
  try {
    const { tour_id, tour_date, number_of_people, total_amount, payment_method } = req.body;
    
    const bookingData = {
      user_id: req.user.id,
      tour_id,
      tour_date,
      number_of_people,
      total_amount,
      payment_method,
      payment_status: 'pending',
      booking_status: 'pending'
    };

    const newBooking = await tourModel.createBooking(bookingData);
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to create booking' });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await tourModel.getUserBookings(req.user.id);
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await tourModel.getBookingById(id);
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    // Auth check
    if (booking.user_id !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.status(200).json({ booking });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    let bookings = [];
    if (req.user.role === 'admin') {
      bookings = await tourModel.getAllBookings();
    } else if (req.user.role === 'tourguide') {
      bookings = await tourModel.getGuideBookings(req.user.id);
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const confirmDummyPayment = async (req, res) => {
  try {
    const { id } = req.params; // booking id
    
    // In a real scenario, this would be a webhook from Stripe/Razorpay.
    // Here we just generate a fake transaction ID and confirm it.
    
    const txnRef = `TXN-DEMO-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    const updatedBooking = await tourModel.updateBookingStatus(id, 'paid', 'confirmed', txnRef);
    
    res.status(200).json({ 
      message: 'Payment confirmed successfully', 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

// --- REVIEWS ---

export const createReview = async (req, res) => {
  try {
    const { tour_id, booking_id, rating, review_text } = req.body;
    
    // Ensure the user actually has a confirmed booking for this tour
    const booking = await tourModel.getBookingById(booking_id);
    
    if (!booking || booking.user_id !== req.user.id || booking.tour_id !== tour_id) {
      return res.status(403).json({ error: 'You are not eligible to review this tour' });
    }
    
    if (booking.payment_status !== 'paid' || booking.booking_status !== 'confirmed') {
      return res.status(403).json({ error: 'You can only review paid and confirmed bookings' });
    }

    const reviewData = {
      tour_id,
      user_id: req.user.id,
      booking_id,
      rating,
      review_text
    };

    const newReview = await tourModel.createReview(reviewData);
    res.status(201).json({ message: 'Review added successfully', review: newReview });
  } catch (error) {
    // Check for unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({ error: 'You have already reviewed this booking' });
    }
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};
