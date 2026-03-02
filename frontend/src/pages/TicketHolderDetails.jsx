import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { releaseSeats, verifyLock } from '../services/api';
import { validateHKID, validatePassport, validateEmail } from '../utils/validation';

const TicketHolderDetails = ({ bookingState, updateBookingState }) => {
  const navigate = useNavigate();
  const [ticketHolders, setTicketHolders] = useState([]);
  const [errors, setErrors] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(600);

  useEffect(() => {
    // Initialize ticket holders
    const holders = Array(bookingState.quantity).fill(null).map((_, index) => ({
      ticketNumber: index + 1,
      fullName: '',
      idType: 'HKID', // HKID or Passport
      idNumber: '',
      nationality: '',
    }));
    setTicketHolders(holders);

    // Start timer verification
    if (bookingState.lockId) {
      const timer = setInterval(async () => {
        try {
          const lockStatus = await verifyLock(bookingState.lockId);
          if (!lockStatus.valid) {
            handleTimeout();
          } else {
            setTimeRemaining(Math.floor(lockStatus.timeRemaining / 1000));
          }
        } catch (err) {
          console.error('Lock verification failed:', err);
        }
      }, 2000);

      return () => clearInterval(timer);
    }
  }, [bookingState.lockId]);

  const handleTimeout = async () => {
    alert('Your booking session has expired. Please start over.');
    navigate('/');
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...ticketHolders];
    updated[index][field] = value;
    setTicketHolders(updated);
    
    // Clear error for this field
    const errorKey = `${index}-${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleIdTypeChange = (index, type) => {
    const updated = [...ticketHolders];
    updated[index].idType = type;
    updated[index].idNumber = '';
    updated[index].nationality = type === 'Passport' ? '' : 'Hong Kong';
    setTicketHolders(updated);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    ticketHolders.forEach((holder, index) => {
      // Validate full name
      if (!holder.fullName.trim()) {
        newErrors[`${index}-fullName`] = 'Full name is required';
        isValid = false;
      } else if (holder.fullName.trim().length < 2) {
        newErrors[`${index}-fullName`] = 'Name must be at least 2 characters';
        isValid = false;
      }

      // Validate ID number
      if (!holder.idNumber.trim()) {
        newErrors[`${index}-idNumber`] = 'ID number is required';
        isValid = false;
      } else {
        if (holder.idType === 'HKID') {
          const validation = validateHKID(holder.idNumber);
          if (!validation.valid) {
            newErrors[`${index}-idNumber`] = validation.message;
            isValid = false;
          }
        } else if (holder.idType === 'Passport') {
          if (!validatePassport(holder.idNumber)) {
            newErrors[`${index}-idNumber`] = 'Invalid passport format (6-9 alphanumeric characters)';
            isValid = false;
          }
        }
      }

      // Validate nationality (required for passport)
      if (holder.idType === 'Passport' && !holder.nationality.trim()) {
        newErrors[`${index}-nationality`] = 'Nationality is required for passport holders';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateForm()) {
      updateBookingState({ ticketHolders });
      navigate('/payment');
    }
  };

  const handleBack = async () => {
    if (bookingState.lockId) {
      try {
        await releaseSeats(bookingState.lockId);
      } catch (err) {
        console.error('Failed to release seats:', err);
      }
    }
    navigate('/seating');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container">
      {timeRemaining > 0 && (
        <div className={`timer ${timeRemaining < 120 ? 'warning' : ''}`}>
          ⏱️ Time Remaining: {formatTime(timeRemaining)}
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#667eea' }}>Ticket Holder Details</h2>
        
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #ffc107' }}>
          <strong>⚠️ Anti-Scalper Policy:</strong> Real-name registration is required for all ticket holders. 
          Valid identification must be presented at the venue entrance.
        </div>

        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Show:</strong> {bookingState.showDate} at {bookingState.showTime}<br />
          <strong>Seats:</strong> {bookingState.selectedSeats.map(s => s.id).join(', ')}<br />
          <strong>Category:</strong> {bookingState.categoryName} (${bookingState.price} per ticket)
        </div>

        {ticketHolders.map((holder, index) => (
          <div key={index} className="ticket-holder-form">
            <h4>Ticket #{holder.ticketNumber} - Seat {bookingState.selectedSeats[index]?.id}</h4>

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor={`name-${index}`}>Full Name (as per ID) *</label>
              <input
                type="text"
                id={`name-${index}`}
                value={holder.fullName}
                onChange={(e) => handleInputChange(index, 'fullName', e.target.value)}
                placeholder="Enter full name"
                style={errors[`${index}-fullName`] ? { borderColor: '#dc3545' } : {}}
              />
              {errors[`${index}-fullName`] && (
                <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>
                  {errors[`${index}-fullName`]}
                </span>
              )}
            </div>

            {/* ID Type Toggle */}
            <div className="form-group">
              <label>Identification Type *</label>
              <div className="id-type-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${holder.idType === 'HKID' ? 'active' : ''}`}
                  onClick={() => handleIdTypeChange(index, 'HKID')}
                >
                  🆔 HKID
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${holder.idType === 'Passport' ? 'active' : ''}`}
                  onClick={() => handleIdTypeChange(index, 'Passport')}
                >
                  🛂 Passport
                </button>
              </div>
            </div>

            {/* ID Number */}
            <div className="form-group">
              <label htmlFor={`id-${index}`}>
                {holder.idType === 'HKID' ? 'HKID Number' : 'Passport Number'} *
              </label>
              <input
                type="text"
                id={`id-${index}`}
                value={holder.idNumber}
                onChange={(e) => handleInputChange(index, 'idNumber', e.target.value.toUpperCase())}
                placeholder={holder.idType === 'HKID' ? 'e.g., A123456(7)' : 'e.g., AB1234567'}
                style={errors[`${index}-idNumber`] ? { borderColor: '#dc3545' } : {}}
              />
              {errors[`${index}-idNumber`] && (
                <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>
                  {errors[`${index}-idNumber`]}
                </span>
              )}
              {holder.idType === 'HKID' && (
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '5px' }}>
                  Format: A123456(7) or AB123456(7)
                </small>
              )}
            </div>

            {/* Nationality (for Passport only) */}
            {holder.idType === 'Passport' && (
              <div className="form-group">
                <label htmlFor={`nationality-${index}`}>Nationality *</label>
                <input
                  type="text"
                  id={`nationality-${index}`}
                  value={holder.nationality}
                  onChange={(e) => handleInputChange(index, 'nationality', e.target.value)}
                  placeholder="Enter nationality"
                  style={errors[`${index}-nationality`] ? { borderColor: '#dc3545' } : {}}
                />
                {errors[`${index}-nationality`] && (
                  <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>
                    {errors[`${index}-nationality`]}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="button-group" style={{ marginTop: '30px' }}>
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back to Seat Selection
          </button>
          <button
            className="btn btn-primary"
            onClick={handleContinue}
            style={{ flex: 1 }}
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketHolderDetails;
