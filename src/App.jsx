import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Chat from './pages/Chat';
import ToursLanding from './pages/Tours/ToursLanding';
import TourDetails from './pages/Tours/TourDetails';
import BookingFlow from './pages/Tours/BookingFlow';
import PaymentConfirm from './pages/Tours/PaymentConfirm';
import AdminDashboard from './pages/Tours/AdminDashboard';
import GuideDashboard from './pages/Tours/GuideDashboard';
import Games from './pages/Games';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Account from './pages/Account';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="portfolio-app">
          <Navbar />
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
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
