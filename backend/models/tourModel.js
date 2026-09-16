import supabase from '../../db.js';

// --- TOURS ---

export const getAllTours = async (filters = {}) => {
  let query = supabase.from('tours').select(`
    *,
    users:tour_guide_id ( id, username, profile_picture )
  `).eq('is_active', true);

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getTourById = async (id) => {
  const { data, error } = await supabase
    .from('tours')
    .select(`
      *,
      users:tour_guide_id ( id, username, profile_picture )
    `)
    .eq('id', id)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
};

export const createTour = async (tourData) => {
  const { data, error } = await supabase
    .from('tours')
    .insert(tourData)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const updateTour = async (id, tourData) => {
  const { data, error } = await supabase
    .from('tours')
    .update(tourData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const deleteTour = async (id) => {
  const { data, error } = await supabase
    .from('tours')
    .update({ is_active: false })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const getToursByGuide = async (guideId) => {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('tour_guide_id', guideId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// --- BOOKINGS ---

export const createBooking = async (bookingData) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const getBookingById = async (id) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      tours ( id, title, image_url, location )
    `)
    .eq('id', id)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
};

export const getUserBookings = async (userId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      tours ( id, title, image_url, location )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      tours ( id, title, image_url, location ),
      users ( id, username, email )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getGuideBookings = async (guideId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      tours!inner ( id, title, image_url, location, tour_guide_id ),
      users ( id, username, email )
    `)
    .eq('tours.tour_guide_id', guideId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateBookingStatus = async (id, payment_status, booking_status, transaction_reference = null) => {
  const updateData = { payment_status, booking_status };
  if (transaction_reference) {
    updateData.transaction_reference = transaction_reference;
  }
  
  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

// --- REVIEWS ---

export const getTourReviews = async (tourId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      users ( id, username, profile_picture )
    `)
    .eq('tour_id', tourId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select('*')
    .single();

  if (error) throw error;
  
  // Also update tour rating
  try {
    const reviews = await getTourReviews(reviewData.tour_id);
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((acc, rev) => acc + rev.rating, 0);
      const avgRating = totalRating / reviews.length;
      await supabase
        .from('tours')
        .update({ 
          rating: parseFloat(avgRating.toFixed(2)),
          review_count: reviews.length
        })
        .eq('id', reviewData.tour_id);
    }
  } catch(e) {
    console.error('Failed to update tour average rating:', e);
  }

  return data;
};
