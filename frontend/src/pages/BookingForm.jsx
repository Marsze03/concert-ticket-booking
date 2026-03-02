import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShows, getCategories, checkAvailability } from '../services/api';

const BookingForm = ({ bookingState, updateBookingState }) => {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedShow, setSelectedShow] = useState(bookingState.showId || null);
  const [selectedCategory, setSelectedCategory] = useState(bookingState.category || null);
  const [quantity, setQuantity] = useState(bookingState.quantity || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [showsData, categoriesData] = await Promise.all([
        getShows(),
        getCategories()
      ]);
      setShows(showsData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to load show information. Please refresh the page.');
    }
  };

  const handleShowSelect = (showId) => {
    setSelectedShow(showId);
    setError('');
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setError('');
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 10) {
      setQuantity(value);
      setError('');
    }
  };

  const handleCheckAvailability = async () => {
    if (!selectedShow) {
      setError('Please select a show date.');
      return;
    }
    if (!selectedCategory) {
      setError('Please select a ticket category.');
      return;
    }
    if (quantity < 1) {
      setError('Please enter a valid quantity.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await checkAvailability(selectedShow, selectedCategory, quantity);
      
      if (result.available) {
        // Update booking state
        const show = shows.find(s => s.id === selectedShow);
        const category = categories.find(c => c.id === selectedCategory);
        
        updateBookingState({
          showId: selectedShow,
          showDate: show.date,
          showTime: show.time,
          category: selectedCategory,
          categoryName: category.name,
          price: category.price,
          quantity: quantity,
          selectedSeats: [],
          lockId: null,
        });
        
        // Navigate to seating plan
        navigate('/seating');
      } else {
        setError(`Unfortunately, only ${result.availableCount} seats are available for this category. Please reduce your quantity or select a different category.`);
      }
    } catch (err) {
      setError('Failed to check availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="container">
        <div className="card booking-card">
          <h2 style={{ marginBottom: '30px', color: '#ff0066', textAlign: 'center', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Book Your Tickets
          </h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {/* Show Selection */}
          <div className="form-group">
            <label style={{ fontSize: '1.1rem', fontWeight: '700' }}>Select Performance Date:</label>
            <div className="show-cards">
              {shows.map(show => (
                <div
                  key={show.id}
                  className={`show-card rock-card ${selectedShow === show.id ? 'selected' : ''}`}
                  onClick={() => handleShowSelect(show.id)}
                >
                  <h3>{show.date}</h3>
                  <p>🕐 {show.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="form-group">
            <label style={{ fontSize: '1.1rem', fontWeight: '700' }}>Select Ticket Category:</label>
            <div className="radio-group">
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`radio-option rock-option ${selectedCategory === category.id ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <label>
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={selectedCategory === category.id}
                      onChange={() => handleCategorySelect(category.id)}
                    />
                    {category.name}
                    <span className="price">${category.price}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="form-group">
            <label htmlFor="quantity" style={{ fontSize: '1.1rem', fontWeight: '700' }}>Number of Tickets (1-10):</label>
            <input
              type="number"
              id="quantity"
              min="1"
              max="10"
              value={quantity}
              onChange={handleQuantityChange}
            />
            <div style={{ 
              marginTop: '12px', 
              padding: '12px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.9rem',
              border: '2px solid #ffd700'
            }}>
              <strong>🎫 Group Bookings:</strong> For more than 10 tickets, please contact our group sales team at{' '}
              <a 
                href="mailto:groupsales@ladyxconcert.hk" 
                style={{ 
                  color: '#ffd700', 
                  textDecoration: 'underline',
                  fontWeight: '700'
                }}
              >
                groupsales@ladyxconcert.hk
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="button-group" style={{ marginTop: '30px' }}>
            <button
              className="btn btn-primary btn-rock"
              onClick={handleCheckAvailability}
              disabled={loading || !selectedShow || !selectedCategory}
              style={{ width: '100%' }}
            >
              {loading ? 'Checking Availability...' : 'Check Availability & Select Seats'}
            </button>
          </div>
        </div>

        {/* Information Card */}
        <div className="card info-card" style={{ background: '#1a1a1a', color: '#fff', marginTop: '20px', border: '2px solid #ff0066' }}>
          <h3 style={{ color: '#ff0066', marginBottom: '15px', textTransform: 'uppercase' }}>Important Information</h3>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>All tickets are subject to availability</li>
            <li>You will have <strong style={{ color: '#ff0066' }}>10 minutes</strong> to complete your booking once seats are selected</li>
            <li>Real-name registration is required for all ticket holders (anti-scalper policy)</li>
            <li>Valid HKID or Passport required for each ticket</li>
            <li>Tickets are non-transferable and non-refundable</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
