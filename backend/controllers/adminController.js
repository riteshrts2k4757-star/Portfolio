import supabase from '../../db.js';

// Get Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [usersData, guidesData, toursData, bookingsData, revenueData] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'tourguide'),
      supabase.from('tours').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id, booking_status', { count: 'exact', head: true }),
      supabase.from('bookings').select('total_amount').eq('payment_status', 'paid')
    ]);

    const totalUsers = usersData.count || 0;
    const totalGuides = guidesData.count || 0;
    const totalTours = toursData.count || 0;
    const totalBookings = bookingsData.count || 0;
    
    // Revenue sum
    const revenue = revenueData.data?.reduce((sum, item) => sum + Number(item.total_amount), 0) || 0;

    res.status(200).json({
      stats: {
        totalUsers,
        totalGuides,
        totalTours,
        totalBookings,
        revenue
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, profile_picture, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ users: data });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update User Role (Promote/Demote)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'user', 'tourguide', 'admin'

    // Prevent changing your own role to avoid locking yourself out
    if (String(req.user.id) === String(id)) {
      return res.status(403).json({ error: 'Cannot change your own role' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('id, username, email, role')
      .single();

    if (error) throw error;
    res.status(200).json({ message: `User role updated to ${role}`, user: data });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (String(req.user.id) === String(id)) {
      return res.status(403).json({ error: 'Cannot delete your own admin account' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get All Reviews (Admin View)
export const getAllReviews = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users:user_id (id, username, email),
        tours:tour_id (id, title)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ reviews: data });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete/Hide Review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Manage Booking Status (Refund, Confirm, Complete)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_status, payment_status } = req.body;
    
    const updates = {};
    if (booking_status) updates.booking_status = booking_status;
    if (payment_status) updates.payment_status = payment_status;

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'Booking updated successfully', booking: data });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
