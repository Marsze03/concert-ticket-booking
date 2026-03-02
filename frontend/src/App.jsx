import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import PerformanceSelection from './pages/PerformanceSelection';
import BookingForm from './pages/BookingForm';
import SeatingPlan from './pages/SeatingPlan';
import TicketHolderDetails from './pages/TicketHolderDetails';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/';

  return (
    <header className="header" style={{ 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)', 
      borderBottom: '3px solid #ff0066',
      position: 'relative'
    }}>
      <div className="container" style={{ position: 'relative' }}>
        {showBackButton && (
          <button
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #ff0066 0%, #ff3385 100%)',
              color: '#fff',
              border: '2px solid #ffd700',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(255, 0, 102, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-50%) scale(1.05)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 0, 102, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(-50%) scale(1)';
              e.target.style.boxShadow = '0 2px 8px rgba(255, 0, 102, 0.3)';
            }}
          >
            ← Home
          </button>
        )}
        <h1 style={{ color: '#ff0066', textShadow: '0 0 20px rgba(255, 0, 102, 0.6), 2px 2px 0 #000' }}>🎸 Lady X Official Ticket Site</h1>
        <p style={{ color: '#ffd700', fontWeight: '600', letterSpacing: '2px' }}>Asia Tour 2026 • Hong Kong</p>
      </div>
    </header>
  );
}

function App() {
  const [bookingState, setBookingState] = useState({
    showId: null,
    showDate: null,
    showTime: null,
    category: null,
    categoryName: null,
    price: null,
    quantity: 0,
    selectedSeats: [],
    lockId: null,
    lockExpiry: null,
    ticketHolders: [],
    contactEmail: '',
    paymentDetails: null,
    bookingId: null,
  });

  const updateBookingState = (updates) => {
    setBookingState(prev => ({ ...prev, ...updates }));
  };

  const resetBooking = () => {
    setBookingState({
      showId: null,
      showDate: null,
      showTime: null,
      category: null,
      categoryName: null,
      price: null,
      quantity: 0,
      selectedSeats: [],
      lockId: null,
      lockExpiry: null,
      ticketHolders: [],
      contactEmail: '',
      paymentDetails: null,
      bookingId: null,
    });
  };

  return (
    <Router>
      <div className="app">
        <Header />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <PerformanceSelection 
                bookingState={bookingState}
                updateBookingState={updateBookingState}
              />
            } 
          />
          <Route 
            path="/booking" 
            element={
              <BookingForm 
                bookingState={bookingState}
                updateBookingState={updateBookingState}
              />
            } 
          />
          <Route 
            path="/seating" 
            element={
              bookingState.showId && bookingState.category && bookingState.quantity > 0 ? (
                <SeatingPlan 
                  bookingState={bookingState}
                  updateBookingState={updateBookingState}
                />
              ) : (
                <Navigate to="/booking" replace />
              )
            } 
          />
          <Route 
            path="/details" 
            element={
              bookingState.selectedSeats.length > 0 ? (
                <TicketHolderDetails 
                  bookingState={bookingState}
                  updateBookingState={updateBookingState}
                />
              ) : (
                <Navigate to="/booking" replace />
              )
            } 
          />
          <Route 
            path="/payment" 
            element={
              bookingState.ticketHolders.length > 0 ? (
                <Payment 
                  bookingState={bookingState}
                  updateBookingState={updateBookingState}
                />
              ) : (
                <Navigate to="/booking" replace />
              )
            } 
          />
          <Route 
            path="/confirmation" 
            element={
              bookingState.bookingId ? (
                <Confirmation 
                  bookingState={bookingState}
                  resetBooking={resetBooking}
                />
              ) : (
                <Navigate to="/booking" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
