import React from 'react';
import { useNavigate } from 'react-router-dom';

const PerformanceSelection = () => {
  const navigate = useNavigate();

  const handleGetTickets = () => {
    navigate('/booking');
  };

  return (
    <div className="landing-page">
      <div className="concert-poster">
        <div className="hero-content">
          <div className="poster-header">LIVE IN CONCERT</div>
          <div className="artist-name">LADY X</div>
          <div className="tour-name">ASIA TOUR 2026</div>
          
          <div className="divider-line"></div>
          
          <div className="venue-info">
            <div className="venue-name">HONG KONG COLISEUM</div>
            <div className="location-city">HONG KONG</div>
          </div>
          
          <div className="show-dates">
            <div className="dates-label">THREE NIGHTS ONLY</div>
            <div className="dates-list">
              <div className="date-item">APRIL 25</div>
              <div className="date-separator">•</div>
              <div className="date-item">APRIL 27</div>
              <div className="date-separator">•</div>
              <div className="date-item">APRIL 29</div>
            </div>
            <div className="year">2026</div>
            <div className="show-time">DOORS OPEN 7:00 PM</div>
          </div>
          
          <div className="divider-line"></div>

          <div className="cta-section">
            <div className="on-sale-now">TICKETS ON SALE NOW</div>
            <button 
              className="btn-join-now"
              onClick={handleGetTickets}
            >
              <span>GET TICKETS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSelection;