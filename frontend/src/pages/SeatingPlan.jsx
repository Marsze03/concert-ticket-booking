import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSeatingPlan, lockSeats, releaseSeats, verifyLock } from '../services/api';

const SeatingPlan = ({ bookingState, updateBookingState }) => {
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [lockId, setLockId] = useState(bookingState.lockId);

  useEffect(() => {
    loadSeatingPlan();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!lockId) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockId]);

  const loadSeatingPlan = async () => {
    try {
      const seatingData = await getSeatingPlan(bookingState.showId, bookingState.category);
      setSeats(seatingData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load seating plan. Please try again.');
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked' || seat.isLocked) {
      return; // Cannot select booked or locked seats
    }

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      
      if (isSelected) {
        // Deselect seat
        return prev.filter(s => s.id !== seat.id);
      } else {
        // Check if we've reached the limit
        if (prev.length >= bookingState.quantity) {
          setError(`You can only select ${bookingState.quantity} seat(s). Deselect a seat to choose another.`);
          return prev;
        }
        // Select seat
        setError('');
        return [...prev, seat];
      }
    });
  };

  const handleConfirmSeats = async () => {
    if (selectedSeats.length !== bookingState.quantity) {
      setError(`Please select exactly ${bookingState.quantity} seat(s).`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const seatIds = selectedSeats.map(s => s.id);
      const lockResult = await lockSeats(bookingState.showId, seatIds);
      
      setLockId(lockResult.lockId);
      updateBookingState({
        selectedSeats: selectedSeats,
        lockId: lockResult.lockId,
        lockExpiry: lockResult.expiresAt,
      });

      // Start the timer
      setTimeRemaining(600);
      
      // Navigate to ticket holder details
      navigate('/details');
    } catch (err) {
      if (err.response?.data?.unavailableSeats) {
        setError('Some selected seats are no longer available. Please select different seats.');
        await loadSeatingPlan(); // Reload seating plan
        setSelectedSeats([]);
      } else {
        setError('Failed to lock seats. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTimeout = async () => {
    if (lockId) {
      try {
        await releaseSeats(lockId);
      } catch (err) {
        console.error('Failed to release seats:', err);
      }
    }
    alert('Your booking session has expired. Please start over.');
    navigate('/');
  };

  const handleBack = () => {
    navigate('/booking');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Group seats by section and row (Hong Kong Coliseum CENTER STAGE style)
  const groupedBySection = seats.reduce((acc, seat) => {
    if (!acc[seat.section]) {
      acc[seat.section] = {};
    }
    if (!acc[seat.section][seat.row]) {
      acc[seat.section][seat.row] = [];
    }
    acc[seat.section][seat.row].push(seat);
    return acc;
  }, {});

  // Section order for display (360° around center stage)
  const sectionOrder = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];

  const sectionNames = {
    'S1': 'Section 1 (North)',
    'S2': 'Section 2 (Northeast)',
    'S3': 'Section 3 (East)',
    'S4': 'Section 4 (Southeast)',
    'S5': 'Section 5 (South)',
    'S6': 'Section 6 (Southwest)',
    'S7': 'Section 7 (West)',
    'S8': 'Section 8 (Northwest)'
  };

  return (
    <div className="container">
      {lockId && (
        <div className={`timer ${timeRemaining < 120 ? 'warning' : ''}`}>
          ⏱️ Time Remaining: {formatTime(timeRemaining)}
        </div>
      )}

      <div className="card">
        <div style={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '25px',
          border: '2px solid #ff0066'
        }}>
          <h2 style={{ marginBottom: '10px', color: '#ff0066', textAlign: 'center', fontSize: '1.8rem' }}>
            🎸 Hong Kong Coliseum - Seat Selection 🎸
          </h2>
        </div>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '25px',
          border: '2px solid #e0e0e0'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong style={{ color: '#666' }}>Performance:</strong>
              <div style={{ color: '#333', fontSize: '1.1rem', fontWeight: '600' }}>
                {bookingState.showDate}
              </div>
              <div style={{ color: '#667eea' }}>{bookingState.showTime}</div>
            </div>
            <div>
              <strong style={{ color: '#666' }}>Category:</strong>
              <div style={{ color: '#333', fontSize: '1.1rem', fontWeight: '600' }}>
                {bookingState.categoryName}
              </div>
              <div style={{ color: '#4CAF50', fontSize: '1.2rem', fontWeight: '700' }}>
                ${bookingState.price}
              </div>
            </div>
            <div>
              <strong style={{ color: '#666' }}>Tickets to Select:</strong>
              <div style={{ color: '#333', fontSize: '1.1rem', fontWeight: '600' }}>
                {bookingState.quantity} seat(s)
              </div>
              <div style={{ 
                color: selectedSeats.length === bookingState.quantity ? '#4CAF50' : '#ff6b6b',
                fontSize: '1.1rem',
                fontWeight: '700'
              }}>
                {selectedSeats.length} selected
                {selectedSeats.length === bookingState.quantity && ' ✓'}
              </div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Legend */}
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' }}></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', border: '2px solid #FF6B00' }}></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#9e9e9e' }}></div>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' }}></div>
            <span>Locked (Other Users)</span>
          </div>
        </div>

        {/* Hong Kong Coliseum Venue Map */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '2px solid #333'
        }}>
          <h3 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem' }}>
            📍 Hong Kong Coliseum - Venue Map
          </h3>
          
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: '#0a0a0a',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #ff0066'
          }}>
            {/* CENTER STAGE Arena Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr',
              gap: '8px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {/* Top Row: S8, S1, S2 */}
              <div style={{
                background: bookingState.category ? 'rgba(255, 255, 255, 0.05)' : '#333',
                padding: '12px 8px',
                textAlign: 'center',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: '#999',
                border: '1px solid #444'
              }}>
                S8<br/>NW
              </div>
              <div style={{
                background: bookingState.category ? 'rgba(255, 255, 255, 0.05)' : '#333',
                padding: '12px 8px',
                textAlign: 'center',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: '#999',
                border: '1px solid #444'
              }}>
                S1<br/>N
              </div>
              <div style={{
                background: bookingState.category ? 'rgba(255, 255, 255, 0.05)' : '#333',
                padding: '12px 8px',
                textAlign: 'center',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: '#999',
                border: '1px solid #444'
              }}>
                S2<br/>NE
              </div>

              {/* Middle Row: S7, STAGE, S3 */}
              <div style={{
                background: bookingState.category ? 'rgba(255, 255, 255, 0.05)' : '#333',
                padding: '12px 8px',
                textAlign: 'center',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: '#999',
                border: '1px solid #444'
              }}>
                S7<br/>W
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ff0066 0%, #ff3385 100%)',
                color: '#fff',
                padding: '20px',
                textAlign: 'center',
                fontWeight: '700',
                borderRadius: '6px',
                border: '2px solid #ffd700',
                fontSize: '0.9rem'
              }}>
                🎸<br/>STAGE<br/>🎸
              </div>
              <div style={{
                background: bookingState.category ? 'rgba(255, 255, 255, 0.05)' : '#333',
                padding: '12px 8px',
                textAlign: 'center',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: '#999',
                border: '1px solid #444'
              }}>
                S3<br/>E
              </div>

              {/* Bottom Row: S6, S5, S4 */}
              <div style={{
                background: bookingState.category ? 'rgba(255, 255, 255, 0.05)' : '#333',
                padding: '12px 8px',
                textAlign: 'center',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: '#999',
                border: '1px solid #444'
              }}>
                S6<br/>SW
              </div>
              <div style={{
                background: bookingState.category ? 'rgba(255, 255, 255, 0.05)' : '#333',
                padding: '12px 8px',
                textAlign: 'center',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: '#999',
                border: '1px solid #444'
              }}>
                S5<br/>S
              </div>
              <div style={{
                background: bookingState.category ? 'rgba(255, 255, 255, 0.05)' : '#333',
                padding: '12px 8px',
                textAlign: 'center',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: '#999',
                border: '1px solid #444'
              }}>
                S4<br/>SE
              </div>
            </div>

            {/* Category Legend */}
            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              <div style={{ 
                color: '#ffd700', 
                fontSize: '0.85rem', 
                fontWeight: '700',
                marginBottom: '12px'
              }}>
                SEATING CATEGORIES (Distance from Stage)
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{
                  background: bookingState.category === 'C' ? 'linear-gradient(135deg, #ff0066 0%, #ff3385 100%)' : '#333',
                  color: bookingState.category === 'C' ? '#fff' : '#999',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: bookingState.category === 'C' ? '2px solid #ffd700' : '1px solid #444'
                }}>
                  <strong>CATEGORY C - $2,480</strong><br/>
                  Rows A-C (Closest){bookingState.category === 'C' && ' ← YOU ARE HERE'}
                </div>
                <div style={{
                  background: bookingState.category === 'B' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#333',
                  color: bookingState.category === 'B' ? '#fff' : '#999',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: bookingState.category === 'B' ? '2px solid #ffd700' : '1px solid #444'
                }}>
                  <strong>CATEGORY B - $1,480</strong><br/>
                  Rows D-G (Middle){bookingState.category === 'B' && ' ← YOU ARE HERE'}
                </div>
                <div style={{
                  background: bookingState.category === 'A' ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' : '#333',
                  color: bookingState.category === 'A' ? '#fff' : '#999',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: bookingState.category === 'A' ? '2px solid #ffd700' : '1px solid #444'
                }}>
                  <strong>CATEGORY A - $980</strong><br/>
                  Rows H-J (Back){bookingState.category === 'A' && ' ← YOU ARE HERE'}
                </div>
              </div>
            </div>

            {/* Legend for map */}
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              fontSize: '0.75rem', 
              marginTop: '15px',
              fontStyle: 'italic'
            }}>
              Arena view from above • All 8 sections surround the center stage • Categories based on distance from stage
            </div>
          </div>
        </div>

        {/* Hong Kong Coliseum Center Stage Seating Layout */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading seating plan...</p>
          </div>
        ) : (
          <div className="venue-layout">
            {/* All 8 Sections for Selected Category */}
            <div className="section-tier">
              <div className="tier-label" style={{ 
                color: bookingState.category === 'C' ? '#ff0066' : bookingState.category === 'B' ? '#667eea' : '#4CAF50', 
                fontWeight: 'bold', 
                fontSize: '1.1rem', 
                marginBottom: '15px' 
              }}>
                {bookingState.category === 'C' && '🌟 CATEGORY C - PREMIUM (Rows A-C, Closest to Stage)'}
                {bookingState.category === 'B' && '⭐ CATEGORY B - MIDDLE (Rows D-G)'}
                {bookingState.category === 'A' && '✓ CATEGORY A - UPPER (Rows H-J)'}
              </div>
              <div className="sections-row">
                {sectionOrder.map(sectionCode => {
                  const section = groupedBySection[sectionCode];
                  if (!section) return null;
                
                return (
                  <div key={sectionCode} className="venue-section">
                    <div className="section-header">{sectionNames[sectionCode]}</div>
                    <div className="section-seats">
                      {Object.keys(section).sort().map(row => (
                        <div key={row} className="seating-row">
                          <div className="row-label">{row}</div>
                          <div className="row-seats">
                            {section[row]
                              .sort((a, b) => a.number - b.number)
                              .map(seat => {
                                const isSelected = selectedSeats.find(s => s.id === seat.id);
                                const isBooked = seat.status === 'booked';
                                const isLocked = seat.isLocked;
                                
                                let seatClass = 'seat ';
                                if (isSelected) {
                                  seatClass += 'selected';
                                } else if (isBooked) {
                                  seatClass += 'booked';
                                } else if (isLocked) {
                                  seatClass += 'locked';
                                } else {
                                  seatClass += 'available';
                                }

                                return (
                                  <div
                                    key={seat.id}
                                    className={seatClass}
                                    onClick={() => handleSeatClick(seat)}
                                    title={`${seat.id} - ${isBooked ? 'Booked' : isLocked ? 'Locked' : 'Available'}`}
                                  >
                                    {isSelected ? '✖' : seat.number}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        )}

        {/* Selected Seats Display */}
        {selectedSeats.length > 0 && (
          <div style={{ 
            marginTop: '30px', 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            borderLeft: '4px solid #667eea'
          }}>
            <strong>Selected Seats:</strong> {selectedSeats.map(s => s.id).join(', ')}
          </div>
        )}

        {/* Action Buttons */}
        <div className="button-group" style={{ marginTop: '30px' }}>
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirmSeats}
            disabled={loading || selectedSeats.length !== bookingState.quantity}
            style={{ flex: 1 }}
          >
            {loading ? 'Locking Seats...' : 
             selectedSeats.length === bookingState.quantity ? 
             'Confirm Seats & Continue' : 
             `Select ${bookingState.quantity - selectedSeats.length} More Seat(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatingPlan;
