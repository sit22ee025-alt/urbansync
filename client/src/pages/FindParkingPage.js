import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './pages.css';

const API_BASE = 'http://localhost:5000/api';

function FindParkingPage({ currentUser }) {
  const navigate = useNavigate();
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: 'Chennai',
    vehicle_type: 'car',
  });

  useEffect(() => {
    searchParkingSpaces();
  }, []);

  const searchParkingSpaces = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filters.city) query.append('city', filters.city);
      if (filters.vehicle_type) query.append('vehicle_type', filters.vehicle_type);

      const response = await fetch(`${API_BASE}/parking-spaces?${query}`);
      const data = await response.json();
      setParkingSpaces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching parking spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchParkingSpaces();
  };

  const handleBooking = (spaceId) => {
    if (!currentUser) {
      navigate('/profile');
    } else {
      navigate(`/parking/${spaceId}`);
    }
  };

  // Helper to determine availability color
  const getAvailabilityColor = (available, total) => {
    if (available === 0) return 'unavailable';
    if (available < total * 0.2) return 'limited';
    return 'available';
  };

  return (
    <div className="page-container">
      <div className="container">
        {/* Search Header */}
        <div className="search-header">
          <h1 className="section-title">Find Parking</h1>
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-group">
              <label>📍 City</label>
              <select name="city" value={filters.city} onChange={handleFilterChange}>
                <option value="Chennai">Chennai</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>
            <div className="search-input-group">
              <label>🚗 Vehicle</label>
              <select name="vehicle_type" value={filters.vehicle_type} onChange={handleFilterChange}>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="ev">EV</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">🔍 Search</button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading"><div className="spinner"></div><p>Finding best spots...</p></div>
        ) : (
          <div className="parking-grid">
            {parkingSpaces.length === 0 ? (
              <p>No parking spaces found matching your criteria.</p>
            ) : (
              parkingSpaces.map((space) => (
                <div key={space.id} className="card">
                  <div className="card-header">
                    <h3>{space.address}</h3>
                    <span className={`status-badge ${space.available_spots > 0 ? 'status-active' : 'status-cancelled'}`}>
                      {space.available_spots > 0 ? 'Available' : 'Full'}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>City:</strong> {space.city}</p>
                    <p>{space.description}</p>
                    
                    <div className="availability-grid">
                      {space.car_spots > 0 && (
                        <div className="availability-card available">
                          <div className="availability-label">Car Spots</div>
                          <div className="availability-number">{space.car_spots}</div>
                        </div>
                      )}
                      {space.bike_spots > 0 && (
                        <div className="availability-card available">
                          <div className="availability-label">Bike Spots</div>
                          <div className="availability-number">{space.bike_spots}</div>
                        </div>
                      )}
                      {space.ev_spots > 0 && (
                        <div className="availability-card available">
                          <div className="availability-label">EV Spots</div>
                          <div className="availability-number">{space.ev_spots}</div>
                        </div>
                      )}
                    </div>

                    <div className="pricing-info">
                       <div className="price-per-hour">
                          ₹{space.car_price_per_hour}/hr (Car)
                        </div>
                      <button className="btn btn-primary" onClick={() => handleBooking(space.id)}>
                        Book Now →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FindParkingPage;