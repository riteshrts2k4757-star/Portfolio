import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Activity, Star } from 'lucide-react';
import './Tours.css';

const TourCard = ({ tour }) => {
  return (
    <div className="tour-card">
      <div className="tour-card-img-wrapper">
        <img 
          src={tour.image_url} 
          alt={tour.title} 
          className="tour-card-img" 
          onError={(e) => { e.target.src = 'https://picsum.photos/seed/fallback/800/600'; }}
        />
        <div className="tour-card-gradient"></div>
        {tour.rating > 0 && (
          <div className="tour-card-badge">
            <Star size={14} fill="currentColor" /> {tour.rating}
          </div>
        )}
      </div>
      
      <div className="tour-card-content">
        <div className="tour-card-header">
          <h3 className="tour-card-title">{tour.title}</h3>
          <p className="tour-card-location">
            <MapPin size={14} /> {tour.location}
          </p>
        </div>
        
        <p className="tour-card-desc">{tour.short_description}</p>
        
        <div className="tour-card-features">
          <div className="tour-feature">
            <Clock size={16} /> <span>{tour.duration_days} Days</span>
          </div>
          <div className="tour-feature">
            <Activity size={16} /> <span>{tour.difficulty}</span>
          </div>
          <div className="tour-feature">
            <Users size={16} /> <span>Up to {tour.max_group_size}</span>
          </div>
        </div>
        
        <div className="tour-card-footer">
          <div className="tour-card-price">
            <span className="price-currency">{tour.currency === 'INR' ? '₹' : tour.currency}</span>
            <span className="price-amount">{Number(tour.price).toLocaleString('en-IN')}</span>
            <span className="price-unit">/person</span>
          </div>
          <div className="tour-card-actions">
            <Link to={`/tours/${tour.id}`} className="btn btn-primary btn-sm">View Details</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
