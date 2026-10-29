import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';
import './RouteTheme.css';

const Home = lazy(() => import('./pages/Home'));
const Chat = lazy(() => import('./pages/Chat'));
const ToursLanding = lazy(() => import('./pages/Tours/ToursLanding'));
const TourDetails = lazy(() => import('./pages/Tours/TourDetails'));
const BookingFlow = lazy(() => import('./pages/Tours/BookingFlow'));
const PaymentConfirm = lazy(() => import('./pages/Tours/PaymentConfirm'));
const AdminDashboard = lazy(() => import('./pages/Tours/AdminDashboard'));
const GuideDashboard = lazy(() => import('./pages/Tours/GuideDashboard'));
const Games = lazy(() => import('./pages/Games'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Account = lazy(() => import('./pages/Account'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FAQ = lazy(() => import('./pages/FAQ'));

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="portfolio-app">
            <Navbar />
            <Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/tours" element={<ToursLanding />} />
                <Route path="/tours/:id" element={<TourDetails />} />
                <Route path="/tours/:id/book" element={<ProtectedRoute><BookingFlow /></ProtectedRoute>} />
                <Route path="/payment/confirm/:bookingId" element={<PaymentConfirm />} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/guide/dashboard" element={<ProtectedRoute><GuideDashboard /></ProtectedRoute>} />
                <Route path="/games" element={<Games />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              </Routes>
            </Suspense>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
