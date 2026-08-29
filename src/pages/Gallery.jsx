import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Map, Play, Image as ImageIcon } from 'lucide-react';
import { jharkhandLocations } from '../data/jharkhandLocations';
import invertedMask from '../data/invertedJharkhand.json';
import 'leaflet/dist/leaflet.css';
import './Gallery.css';

// Fix for default Leaflet marker icons not loading correctly in some React setups
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for Selected Location
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon.Default();

// Component to dynamically center map when a new location is selected
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 9, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const Gallery = () => {
  // Select the first location by default
  const [selectedLoc, setSelectedLoc] = useState(jharkhandLocations[0]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Center of Jharkhand roughly
  const defaultCenter = [23.6102, 85.2799];

  // Bounding box for Jharkhand to restrict panning
  // [SouthWest, NorthEast]
  const jharkhandBounds = [
    [21.8, 83.2], // Southwest corner
    [25.5, 88.0]  // Northeast corner
  ];

  // Handle location selection
  const handleSelectLocation = (loc) => {
    if (selectedLoc.id === loc.id) return;
    setLoadingMedia(true);
    setSelectedLoc(loc);
    setCurrentImageIndex(0); // Reset image index on new location
    // Simulate loading delay for smooth transitions
    setTimeout(() => setLoadingMedia(false), 400);
  };

  const handleNextImage = () => {
    if (selectedLoc.images && selectedLoc.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedLoc.images.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedLoc.images && selectedLoc.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedLoc.images.length) % selectedLoc.images.length);
    }
  };

  return (
    <div className="gallery-page">
      {/* Header */}
      <div className="gallery-header">
        <h1>Explore Jharkhand</h1>
        <p>Discover the natural beauty and heritage of our state through an interactive journey.</p>
      </div>

      {/* Map Section */}
      <div className="gallery-map-container glass-box">
        <MapContainer 
          center={defaultCenter} 
          zoom={7} 
          minZoom={7}
          maxBounds={jharkhandBounds}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true} 
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <GeoJSON 
            data={invertedMask} 
            style={{ 
              fillColor: '#ffffff', 
              fillOpacity: 1, 
              color: '#4ade80', 
              weight: 2 
            }} 
          />
          
          <MapUpdater center={[selectedLoc.latitude, selectedLoc.longitude]} />

          {jharkhandLocations.map((loc) => (
            <Marker 
              key={loc.id} 
              position={[loc.latitude, loc.longitude]}
              icon={selectedLoc.id === loc.id ? selectedIcon : defaultIcon}
              eventHandlers={{
                click: () => handleSelectLocation(loc),
              }}
            >
              <Popup className="gallery-popup">
                <strong>{loc.name}</strong><br/>
                <span className="text-muted">{loc.district}</span><br/>
                <button 
                  className="popup-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectLocation(loc);
                  }}
                >
                  Explore <MapPin size={12} />
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Dynamic Media Panel */}
      <div className="gallery-media-panel">
        <div className={`media-content-wrapper ${loadingMedia ? 'loading' : ''}`}>
          
          {/* Info Section */}
          <div className="media-info glass-box">
            <div className="media-title-group">
              <h2>{selectedLoc.name}</h2>
              <span className="badge">
                <Map size={14} />
                {selectedLoc.district}, Jharkhand
              </span>
            </div>
            <p className="media-description">
              {selectedLoc.description}
            </p>
          </div>

          {/* Media Grid */}
          <div className="media-grid">
            {/* Image Box */}
            <div className="media-box glass-box">
              <div className="media-box-header">
                <h3><ImageIcon size={18} /> Photograph</h3>
              </div>
              <div className="media-asset" style={{ position: 'relative' }}>
                {selectedLoc.images && selectedLoc.images.length > 1 ? (
                  <>
                    <img src={selectedLoc.images[currentImageIndex]} alt={`${selectedLoc.name} - ${currentImageIndex + 1}`} loading="lazy" />
                    <button className="carousel-btn prev-btn" onClick={handlePrevImage}>❮</button>
                    <button className="carousel-btn next-btn" onClick={handleNextImage}>❯</button>
                    <div className="carousel-indicator">
                      {currentImageIndex + 1} / {selectedLoc.images.length}
                    </div>
                  </>
                ) : selectedLoc.imageUrl ? (
                  <img src={selectedLoc.imageUrl} alt={selectedLoc.name} loading="lazy" />
                ) : (
                  <div className="media-placeholder">
                    <ImageIcon size={40} />
                    <p>Image coming soon</p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Box */}
            <div className="media-box glass-box">
              <div className="media-box-header">
                <h3><Play size={18} /> Video Overview</h3>
              </div>
              <div className="media-asset">
                {selectedLoc.videoUrl ? (
                  <video 
                    src={selectedLoc.videoUrl} 
                    controls 
                    preload="metadata"
                    poster={selectedLoc.imageUrl} // Use image as poster if possible
                  />
                ) : (
                  <div className="media-placeholder">
                    <Play size={40} />
                    <p>Video unavailable — more media coming soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Gallery;
