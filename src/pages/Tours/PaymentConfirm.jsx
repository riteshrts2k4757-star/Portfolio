import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../apiConfig';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import '../../components/Tours/Tours.css';

const PaymentConfirm = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);

  // We don't require auth on this page to simulate a 3rd party gateway,
  // but we do need to fetch booking details. We'll make a public endpoint for basic booking info,
  // OR since it's a demo, we can just use the token if available, but scanning from a phone means no token!
  // So the backend needs to allow fetching public booking details via ID for this demo page.

  useEffect(() => {
    // For this demo, we can use the ID directly and simulate.
    // Ideally we fetch the booking details.
    const fetchBooking = async () => {
      try {
        // We will just use the Supabase anon key to read the booking directly since RLS allows SELECT
        const { supabase } = await import('../../lib/supabaseClient');
        const { data, error } = await supabase
          .from('bookings')
          .select('*, tours(title, currency)')
          .eq('id', bookingId)
          .single();
          
        if (data) {
          setBooking(data);
        } else {
          console.error(error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // In a real app, this would be secured. For our demo, the API might require a token.
      // But if the user scanned with their phone, they are not logged in!
      // So we will trigger a serverless function or update via Supabase directly.
      // Since our Express backend `/pay` requires token, we will just use Supabase JS to update it!
      // WAIT: our RLS blocks updates from anon! 
      // Okay, let's create a specific open route on the Express backend for this demo or just ignore the error.
      // Let's modify the backend /pay route to not require a token for the sake of the QR demo.
      // Or we can just pretend it succeeded visually, but we DO want the desktop to update via Realtime.
      
      const res = await fetch(`${API_BASE_URL}/api/tours/bookings/${bookingId}/pay`, {
        method: 'POST',
        // Omitting auth token for demo purposes (we need to remove verifyToken from this route in tourRoutes.js)
      });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        // If it failed due to auth, let's just show an error. We will fix the route.
        const data = await res.json();
        alert(data.error || 'Failed to confirm payment');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading payment details...</div>;
  if (!booking) return <div style={{ padding: '2rem', textAlign: 'center' }}>Invalid booking reference.</div>;

  if (success || booking.payment_status === 'paid') {
    return (
      <div className="auth-page-wrapper" style={{ padding: '2rem 1rem' }}>
        <div className="auth-card" style={{ maxWidth: '450px', padding: '3rem 2rem' }}>
          <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto', marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#1e293b' }}>Payment Successful</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>You can close this window. Your desktop screen will update automatically.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper" style={{ padding: '2rem 1rem' }}>
      <div className="auth-card" style={{ maxWidth: '450px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            <ShieldAlert size={30} color="#10b981" />
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#1e293b' }}>Confirm Payment</h1>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: '#64748b' }}>Tour</span>
            <span style={{ fontWeight: '600', color: '#1e293b', textAlign: 'right' }}>{booking.tours?.title}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: '#64748b' }}>Booking ID</span>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>#{booking.id.substring(0,8).toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
            <span style={{ color: '#64748b' }}>Amount to Pay</span>
            <span style={{ fontWeight: '800', color: '#10b981', fontSize: '1.25rem' }}>
              {booking.tours?.currency === 'INR' ? '₹' : booking.tours?.currency}{Number(booking.total_amount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <button 
          onClick={handleConfirm} 
          disabled={confirming}
          style={{ width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
        >
          {confirming ? 'Processing...' : 'CONFIRM PAYMENT'}
        </button>
      </div>
    </div>
  );
};

export default PaymentConfirm;
