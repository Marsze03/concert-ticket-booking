import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Confirmation = ({ bookingState, resetBooking }) => {
  const navigate = useNavigate();

  // Verify we have booking data
  if (!bookingState || !bookingState.bookingId) {
    return (
      <div className="container">
        <div className="card">
          <h2>⚠️ No Booking Found</h2>
          <p>Please complete a booking first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/booking')}>
            Start New Booking
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Add keyboard shortcut for printing (Ctrl+P)
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handleNewBooking = () => {
    resetBooking();
    navigate('/');
  };

  const handlePrint = () => {
    try {
      // Add a print-specific class before printing
      document.body.classList.add('printing');
      
      // Trigger print dialog
      window.print();
      
      // Remove the class after printing
      setTimeout(() => {
        document.body.classList.remove('printing');
      }, 100);
    } catch (error) {
      console.error('Print failed:', error);
      alert('Unable to open print dialog. Please use your browser menu: File > Print (or press Ctrl+P)');
    }
  };

  const totalAmount = bookingState.price * bookingState.quantity;

  return (
    <div className="container">
      <div className="card confirmation-card">
        {/* Print-only header */}
        <div className="print-only" style={{ 
          display: 'none',
          textAlign: 'center', 
          borderBottom: '3px solid #000',
          paddingBottom: '15px',
          marginBottom: '20px'
        }}>
          <h1 style={{ fontSize: '24pt', margin: '0', fontWeight: 'bold' }}>LADY X CONCERT</h1>
          <p style={{ fontSize: '12pt', margin: '5px 0', color: '#666' }}>
            Hong Kong Coliseum • Official Ticket Confirmation
          </p>
          <p style={{ fontSize: '10pt', margin: '5px 0', color: '#999' }}>
            Printed: {new Date().toLocaleString('en-HK', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="icon">✅</div>
        <h2>Transaction Successful!</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px' }}>
          Your booking has been confirmed. Thank you for your purchase!
        </p>

        {/* Booking ID */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Booking Reference</div>
          <div className="booking-id" style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '5px', letterSpacing: '2px' }}>
            {bookingState.bookingId?.toUpperCase().slice(0, 8)}
          </div>
          {/* Barcode representation for print */}
          <div className="print-only" style={{ 
            marginTop: '15px',
            fontFamily: 'monospace',
            fontSize: '8pt',
            textAlign: 'center',
            letterSpacing: '1px',
            borderTop: '1px solid rgba(255,255,255,0.3)',
            paddingTop: '10px'
          }}>
            Full ID: {bookingState.bookingId}
          </div>
        </div>

        {/* Show Details */}
        <div className="booking-details">
          <h3>Show Details</h3>
          <div className="detail-row">
            <span className="detail-label">Event:</span>
            <span className="detail-value">Lady X Concert</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{bookingState.showDate}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Time:</span>
            <span className="detail-value">{bookingState.showTime}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{bookingState.categoryName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Seats:</span>
            <span className="detail-value" style={{ fontWeight: '700', color: '#667eea' }}>
              {bookingState.selectedSeats.map(s => s.id).join(', ')}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total Paid:</span>
            <span className="detail-value" style={{ fontWeight: '700', color: '#4CAF50', fontSize: '1.2rem' }}>
              ${totalAmount}
            </span>
          </div>
        </div>

        {/* Ticket Holders */}
        <div className="booking-details">
          <h3>Registered Ticket Holders</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
            ⚠️ Valid identification must be presented at the venue entrance for verification.
          </p>
          <div className="ticket-holders-list">
            {bookingState.ticketHolders.map((holder, index) => (
              <div key={index} className="holder-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: '#667eea' }}>
                    Ticket #{holder.ticketNumber} - Seat {bookingState.selectedSeats[index]?.id}
                  </strong>
                  <span style={{ 
                    background: '#667eea', 
                    color: 'white', 
                    padding: '2px 10px', 
                    borderRadius: '12px',
                    fontSize: '0.85rem'
                  }}>
                    {holder.idType}
                  </span>
                </div>
                <div style={{ color: '#333' }}>
                  <strong>Name:</strong> {holder.fullName}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  <strong>ID:</strong> {holder.idNumber}
                  {holder.nationality && holder.idType === 'Passport' && (
                    <span> | <strong>Nationality:</strong> {holder.nationality}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="booking-details">
          <h3>Contact Information</h3>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{bookingState.contactEmail}</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }} className="no-print">
            📧 A confirmation email will be sent to this address. 
            Please save this confirmation page for your records.
          </p>
          <p className="print-only" style={{ fontSize: '9pt', color: '#333', marginTop: '10px' }}>
            Contact email registered for this booking.
          </p>
        </div>

        {/* Important Information */}
        <div style={{ 
          background: '#fff3cd', 
          padding: '20px', 
          borderRadius: '8px', 
          marginTop: '30px',
          borderLeft: '4px solid #ffc107',
          textAlign: 'left'
        }}>
          <h4 style={{ color: '#856404', marginBottom: '10px' }}>📋 Important Information</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#856404' }}>
            <li>Please arrive at least 30 minutes before showtime</li>
            <li>Bring your e-ticket (printed or mobile) and valid ID for verification</li>
            <li>Each ticket holder must present their registered ID at entrance</li>
            <li>Tickets are non-transferable and non-refundable</li>
            <li>Photography and recording are strictly prohibited during the show</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="button-group" style={{ marginTop: '40px' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            🖨️ Print Confirmation
          </button>
          <button className="btn btn-primary" onClick={handleNewBooking} style={{ flex: 1 }}>
            Book More Tickets
          </button>
        </div>

        <p style={{ marginTop: '30px', fontSize: '0.9rem', color: '#999' }}>
          For any inquiries, please contact our customer service at support@ladyx.com
        </p>

        {/* Print-only footer */}
        <div className="print-only" style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '2px solid #ccc',
          textAlign: 'center',
          fontSize: '9pt',
          color: '#666'
        }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
            ⚠️ AUTHENTICATION NOTICE
          </p>
          <p style={{ margin: '5px 0' }}>
            This is an official e-ticket confirmation. Present this document along with valid photo ID at venue entrance.
          </p>
          <p style={{ margin: '5px 0' }}>
            Booking ID must match ticket holder's registered identification.
          </p>
          <p style={{ margin: '15px 0 5px', fontSize: '8pt', color: '#999' }}>
            Lady X Concert 2026 • Hong Kong Coliseum • Managed by URBTIX
          </p>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
