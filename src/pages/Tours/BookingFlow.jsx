import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../apiConfig';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, Users, CreditCard, Smartphone, CheckCircle, ChevronLeft, Building, MapPin } from 'lucide-react';
import '../../components/Tours/Tours.css';

const BookingFlow = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // Form State
  const [date, setDate] = useState('');
  const [people, setPeople] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchTour = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tours/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTour(data.tour);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTour();
  }, [id, user, navigate]);

  // Supabase Realtime Listener for Payment Confirmation
  useEffect(() => {
    if (!bookingId) return;

    const channel = supabase
      .channel('public:bookings')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` },
        (payload) => {
          if (payload.new.payment_status === 'paid') {
            setStep(4); // Move to success step automatically
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  if (!tour) return <div className="tours-page"><div className="empty-state">Loading...</div></div>;

  const totalAmount = tour.price * people;

  const handleCreateBooking = async () => {
    if (!date || people < 1 || !paymentMethod) return alert('Please fill all details');
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/tours/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          tour_id: id,
          tour_date: date,
          number_of_people: people,
          total_amount: totalAmount,
          payment_method: paymentMethod
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setBookingId(data.booking.id);
        
        if (paymentMethod === 'upi') {
          setStep(3); // QR Code step
        } else {
          // Fake card processing delay
          setTimeout(() => {
            confirmPayment(data.booking.id);
          }, 2000);
          setStep(2.5); // Processing UI
        }
      } else {
        const errorData = await res.json();
        alert(`Failed to create booking: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Booking failed', err);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (bId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/tours/bookings/${bId}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStep(4);
    } catch (e) {
      console.error(e);
    }
  };

  const paymentUrl = `${window.location.origin}/payment/confirm/${bookingId}`;

  return (
    <div className="tours-page" style={{ padding: '0 5%' }}>
      <div className="booking-split-layout">
        
        {/* LEFT COLUMN: Summary Sidebar */}
        <div className="booking-summary-sidebar">
          <img src={tour.image_url} alt={tour.title} className="booking-summary-img" />
          <div className="booking-summary-content">
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>{tour.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MapPin size={16} /> {tour.location}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date</span>
                <span style={{ fontWeight: '500' }}>{date || 'Not selected'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Passengers</span>
                <span style={{ fontWeight: '500' }}>{people}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Price per person</span>
                <span style={{ fontWeight: '500' }}>{tour.currency === 'INR' ? '₹' : tour.currency}{Number(tour.price).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-2)' }}>{tour.currency === 'INR' ? '₹' : tour.currency}{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Area */}
        <div className="booking-form-area">
          {/* Stepper Header */}
          <div className="booking-stepper">
            <div className={`step-indicator ${step >= 1 ? 'completed' : ''}`}>1</div>
            <div className={`step-indicator ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>2</div>
            <div className={`step-indicator ${step >= 4 ? 'completed' : ''}`}>3</div>
          </div>

          <div className="fade-slide-enter" key={`step-${step}`}>
            {step === 1 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <button onClick={() => navigate(`/tours/${id}`)} className="btn btn-outline btn-sm" style={{ padding: '0.5rem' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Trip Details</h2>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                  <div>
                    <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                      <Calendar size={18} color="var(--accent-1)" /> Select Date
                    </label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="auth-input-premium" 
                      min={new Date().toISOString().split('T')[0]} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                      <Users size={18} color="var(--accent-1)" /> Number of Passengers
                    </label>
                    <div className="passenger-counter">
                      <button type="button" className="counter-btn" onClick={() => setPeople(Math.max(1, people - 1))} disabled={people <= 1}>-</button>
                      <div className="counter-value">{people}</div>
                      <button type="button" className="counter-btn" onClick={() => setPeople(Math.min(tour.max_group_size, people + 1))} disabled={people >= tour.max_group_size}>+</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', margin: 0 }}>Maximum {tour.max_group_size} people per booking</p>
                  </div>
                </div>

                <button className="auth-btn-premium" onClick={() => {
                  if(!date) return alert('Please select a date');
                  setStep(2);
                }}>
                  Proceed to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', fontWeight: '800' }}>Select Payment</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: `2px solid ${paymentMethod === 'card' ? 'var(--accent-1)' : 'var(--glass-border)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: paymentMethod === 'card' ? 'rgba(74, 222, 128, 0.05)' : 'transparent' }}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-1)' }} />
                    <CreditCard size={24} color={paymentMethod === 'card' ? 'var(--accent-1)' : 'var(--text-muted)'} />
                    <div style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-main)' }}>Credit/Debit Card</div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: `2px solid ${paymentMethod === 'upi' ? 'var(--accent-1)' : 'var(--glass-border)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: paymentMethod === 'upi' ? 'rgba(74, 222, 128, 0.05)' : 'transparent' }}>
                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-1)' }} />
                    <Smartphone size={24} color={paymentMethod === 'upi' ? 'var(--accent-1)' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-main)' }}>UPI (QR Code)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scan with any UPI app</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: `2px solid ${paymentMethod === 'netbanking' ? 'var(--accent-1)' : 'var(--glass-border)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: paymentMethod === 'netbanking' ? 'rgba(74, 222, 128, 0.05)' : 'transparent' }}>
                    <input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-1)' }} />
                    <Building size={24} color={paymentMethod === 'netbanking' ? 'var(--accent-1)' : 'var(--text-muted)'} />
                    <div style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-main)' }}>Net Banking</div>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" style={{ padding: '1rem 2rem' }} onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '1rem' }} onClick={handleCreateBooking} disabled={!paymentMethod || loading}>
                    {loading ? 'Processing...' : `Pay ${tour.currency === 'INR' ? '₹' : tour.currency}${totalAmount.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>
            )}

            {step === 2.5 && (
              <div className="empty-state" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: 'none' }}>
                <div className="account-loading-spinner" style={{ margin: '0 auto', marginBottom: '1.5rem', width: '50px', height: '50px', borderTopColor: 'var(--accent-1)' }}></div>
                <h2 style={{ marginBottom: '0.5rem' }}>Simulating Payment...</h2>
                <p style={{ color: 'var(--text-muted)' }}>Please do not refresh the page.</p>
              </div>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: '800' }}>Scan to Pay</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Scan this QR code with your mobile phone.</p>
                
                {window.location.hostname === 'localhost' && (
                  <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                    <strong>Mobile QR Tip:</strong> Use your local IP instead of localhost to scan with a phone!
                  </div>
                )}
                
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', display: 'inline-block', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', marginBottom: '2rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <QRCodeSVG value={paymentUrl} size={200} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <div className="account-loading-spinner" style={{ width: '20px', height: '20px', borderTopColor: 'var(--text-muted)', borderWidth: '2px' }}></div>
                  Waiting for confirmation...
                </div>
                
                <div style={{ marginTop: '2rem' }}>
                  <a href={paymentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-1)', textDecoration: 'underline', fontSize: '0.9rem' }}>Open Payment Page (Testing)</a>
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={80} color="var(--accent-2)" style={{ margin: '0 auto', marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>Booking Confirmed!</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Your adventure awaits.</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                  <button className="btn btn-outline" style={{ padding: '1rem' }} onClick={() => navigate('/account')}>View Bookings</button>
                  <button className="btn btn-primary" style={{ padding: '1rem' }} onClick={() => navigate('/tours')}>More Tours</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
