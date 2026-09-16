import React, { useState, useEffect } from 'react';
import { Search, Compass } from 'lucide-react';
import TourCard from '../../components/Tours/TourCard';
import { API_BASE_URL } from '../../apiConfig';
import '../../components/Tours/Tours.css';

const ToursLanding = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', difficulty: '', search: '' });
  const [displayCount, setDisplayCount] = useState(6);

  useEffect(() => {
    fetchTours();
  }, [filters]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/api/tours?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTours(data.tours);
      }
    } catch (error) {
      console.error('Failed to fetch tours', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="tours-page">
      {/* FILTERS - Moved just below navbar */}
      <div className="tours-filters-wrapper">
        <div className="tours-filters-container">
          <div className="tours-search-bar">
            <Search size={20} color="var(--text-muted)" />
            <input 
              type="text" 
              name="search" 
              placeholder="Search destinations, tours..." 
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="tours-filters-group">
            <select name="category" value={filters.category} onChange={handleFilterChange} className="tours-filter-select">
              <option value="">All Categories</option>
              <option value="Mountain">Mountain</option>
              <option value="Beach">Beach</option>
              <option value="Desert">Desert</option>
              <option value="Culture">Culture</option>
              <option value="Adventure">Adventure</option>
              <option value="Trekking">Trekking</option>
              <option value="Nature">Nature</option>
            </select>
            
            <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="tours-filter-select">
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Light-weight Header matching existing site */}
      <div className="header-container" style={{ padding: '3rem 5%', textAlign: 'center', justifyContent: 'center' }}>
        <div className="header-text" style={{ alignItems: 'center' }}>
          <h1>Explore Tours</h1>
          <h2>Discover breathtaking destinations and handpicked experiences</h2>
        </div>
      </div>

      {/* TOURS GRID */}
      <div className="tours-list-section">
        {loading ? (
          <div className="empty-state">
            <div className="account-loading-spinner" style={{ margin: '0 auto', borderTopColor: 'var(--accent-1)' }}></div>
            <p>Loading tours...</p>
          </div>
        ) : tours.length > 0 ? (
          <>
            <div className="tours-grid">
              {tours.slice(0, displayCount).map(tour => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
            {tours.length > displayCount && (
              <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={() => setDisplayCount(prev => prev + 6)}
                  style={{ padding: '0.8rem 2.5rem', borderRadius: '30px', fontWeight: 'bold' }}
                >
                  Show More Tours
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <Compass size={48} />
            <h3>No tours found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursLanding;
