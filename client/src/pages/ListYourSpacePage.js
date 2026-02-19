import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './pages.css';

const API_BASE = 'http://localhost:5000/api';

function ListYourSpacePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    address: '',
    city: 'Chennai',
    space_type: 'standard',
    car_spots: 1,
    bike_spots: 0,
    ev_spots: 0,
    description: '',
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const totalSpots = formData.car_spots + formData.bike_spots + formData.ev_spots;
    if (totalSpots === 0) {
      setError('Please add at least one parking spot');
      return;
    }

    if (!formData.owner_name || !formData.owner_email || !formData.owner_phone || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/parking-spaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        // Save owner email to fetch analytics later
        localStorage.setItem('ownerEmail', formData.owner_email);
        alert('Parking space listed successfully!');
        navigate('/dashboard');
      } else {
        setError(data.error || 'Failed to list space');
      }
    } catch (err) {
      setError('Server connection failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <h2 className="section-title">List Your Parking Space</h2>
        <div className="profile-card">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            {/* Owner Details */}
            <h3>Owner Details</h3>
            <div className="form-group">
              <label>Name *</label>
              <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="owner_email" value={formData.owner_email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input type="tel" name="owner_phone" value={formData.owner_phone} onChange={handleChange} required />
            </div>

            {/* Space Details */}
            <h3 style={{ marginTop: '1.5rem' }}>Space Details</h3>
            <div className="form-group">
              <label>Address *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>City *</label>
              <select name="city" value={formData.city} onChange={handleChange}>
                <option value="Chennai">Chennai</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>

            <div className="form-group">
              <label>Available Spots</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem' }}>Car Spots</label>
                  <input type="number" name="car_spots" value={formData.car_spots} onChange={handleChange} min="0" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem' }}>Bike Spots</label>
                  <input type="number" name="bike_spots" value={formData.bike_spots} onChange={handleChange} min="0" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem' }}>EV Spots</label>
                  <input type="number" name="ev_spots" value={formData.ev_spots} onChange={handleChange} min="0" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Any specific instructions..." />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? '⏳ Listing Space...' : '📍 List My Space'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ListYourSpacePage;