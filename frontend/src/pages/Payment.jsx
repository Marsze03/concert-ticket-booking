import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeBooking, releaseSeats, verifyLock } from '../services/api';
import { validateEmail, validateCreditCard, validateExpiryDate, formatCardNumber, formatExpiryDate } from '../utils/validation';

const Payment = ({ bookingState, updateBookingState }) => {
  const navigate = useNavigate();
  const [contactEmail, setContactEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [bank, setBank] = useState('');
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600);

  useEffect(() => {
    // Timer verification
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

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      setCardNumber(value);
      if (errors.cardNumber) {
        setErrors({ ...errors, cardNumber: '' });
      }
    }
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiryDate(formatExpiryDate(value));
      if (errors.expiryDate) {
        setErrors({ ...errors, expiryDate: '' });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate email
    if (!contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
      isValid = false;
    } else if (!validateEmail(contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
      isValid = false;
    }

    // Validate card number
    if (!cardNumber) {
      newErrors.cardNumber = 'Card number is required';
      isValid = false;
    } else if (!validateCreditCard(cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
      isValid = false;
    }

    // Validate card holder
    if (!cardHolder.trim()) {
      newErrors.cardHolder = 'Cardholder name is required';
      isValid = false;
    }

    // Validate expiry date
    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
      isValid = false;
    } else if (!validateExpiryDate(expiryDate)) {
      newErrors.expiryDate = 'Invalid or expired date (MM/YY)';
      isValid = false;
    }

    // Validate bank
    if (!bank.trim()) {
      newErrors.bank = 'Issuing bank is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Complete booking
      const bookingData = {
        lockId: bookingState.lockId,
        showId: bookingState.showId,
        seatIds: bookingState.selectedSeats.map(s => s.id),
        ticketHolders: bookingState.ticketHolders,
        contactEmail: contactEmail,
        paymentDetails: {
          cardNumber: cardNumber,
          cardHolder: cardHolder,
          expiryDate: expiryDate,
          bank: bank,
        },
      };

      const result = await completeBooking(bookingData);

      if (result.success) {
        updateBookingState({
          contactEmail: contactEmail,
          paymentDetails: { cardHolder, bank },
          bookingId: result.bookingId,
        });
        navigate('/confirmation');
      }
    } catch (err) {
      if (err.response?.data?.error === 'Booking session expired') {
        alert('Your booking session has expired. Please start over.');
        navigate('/');
      } else {
        alert('Payment failed. Please try again or contact support.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/details');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalAmount = bookingState.price * bookingState.quantity;

  return (
    <div className="container">
      {timeRemaining > 0 && (
        <div className={`timer ${timeRemaining < 120 ? 'warning' : ''}`}>
          ⏱️ Time Remaining: {formatTime(timeRemaining)}
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#667eea' }}>Payment & Contact Information</h2>

        {/* Order Summary */}
        <div className="payment-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Show:</span>
            <span>{bookingState.showDate} at {bookingState.showTime}</span>
          </div>
          <div className="summary-row">
            <span>Seats:</span>
            <span>{bookingState.selectedSeats.map(s => s.id).join(', ')}</span>
          </div>
          <div className="summary-row">
            <span>Category:</span>
            <span>{bookingState.categoryName}</span>
          </div>
          <div className="summary-row">
            <span>Price per Ticket:</span>
            <span>${bookingState.price}</span>
          </div>
          <div className="summary-row">
            <span>Quantity:</span>
            <span>{bookingState.quantity}</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount:</span>
            <span>${totalAmount}</span>
          </div>
        </div>

        {processing ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <h3 style={{ marginTop: '20px', color: '#667eea' }}>Processing Payment...</h3>
            <p>Please wait while we contact your bank for approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Contact Email */}
            <div className="form-group">
              <label htmlFor="email">Contact Email Address *</label>
              <input
                type="email"
                id="email"
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(e.target.value);
                  if (errors.contactEmail) setErrors({ ...errors, contactEmail: '' });
                }}
                placeholder="your.email@example.com"
                style={errors.contactEmail ? { borderColor: '#dc3545' } : {}}
              />
              {errors.contactEmail && (
                <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.contactEmail}</span>
              )}
              <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '5px' }}>
                E-ticket and confirmation will be sent to this address
              </small>
            </div>

            <h3 style={{ color: '#667eea', marginTop: '30px', marginBottom: '20px' }}>Credit Card Details</h3>

            {/* Card Number */}
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number *</label>
              <input
                type="text"
                id="cardNumber"
                value={formatCardNumber(cardNumber)}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                style={errors.cardNumber ? { borderColor: '#dc3545' } : {}}
              />
              {errors.cardNumber && (
                <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.cardNumber}</span>
              )}
            </div>

            {/* Card Holder Name */}
            <div className="form-group">
              <label htmlFor="cardHolder">Name of Credit Card Holder *</label>
              <input
                type="text"
                id="cardHolder"
                value={cardHolder}
                onChange={(e) => {
                  setCardHolder(e.target.value.toUpperCase());
                  if (errors.cardHolder) setErrors({ ...errors, cardHolder: '' });
                }}
                placeholder="JOHN DOE"
                style={errors.cardHolder ? { borderColor: '#dc3545' } : {}}
              />
              {errors.cardHolder && (
                <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.cardHolder}</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Expiry Date */}
              <div className="form-group">
                <label htmlFor="expiry">Expiry Date *</label>
                <input
                  type="text"
                  id="expiry"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  style={errors.expiryDate ? { borderColor: '#dc3545' } : {}}
                />
                {errors.expiryDate && (
                  <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.expiryDate}</span>
                )}
              </div>

              {/* Bank */}
              <div className="form-group">
                <label htmlFor="bank">Issuing Bank *</label>
                <select
                  id="bank"
                  value={bank}
                  onChange={(e) => {
                    setBank(e.target.value);
                    if (errors.bank) setErrors({ ...errors, bank: '' });
                  }}
                  style={errors.bank ? { borderColor: '#dc3545' } : {}}
                >
                  <option value="">Select Bank</option>
                  <option value="HSBC">HSBC</option>
                  <option value="Hang Seng Bank">Hang Seng Bank</option>
                  <option value="Bank of China">Bank of China</option>
                  <option value="Standard Chartered">Standard Chartered</option>
                  <option value="Citibank">Citibank</option>
                  <option value="DBS">DBS</option>
                  <option value="Other">Other</option>
                </select>
                {errors.bank && (
                  <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{errors.bank}</span>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px', marginTop: '20px', borderLeft: '4px solid #2196F3' }}>
              🔒 Your payment information is securely encrypted and processed through our banking partner.
            </div>

            {/* Action Buttons */}
            <div className="button-group" style={{ marginTop: '30px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                ← Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Complete Payment - ${totalAmount}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Payment;
