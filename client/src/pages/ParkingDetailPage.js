import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './pages.css';

const API_BASE = 'http://localhost:5000/api';

function ParkingDetailPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchParkingSpace();
  }, [id]);

  const fetchParkingSpace = async () => {
    try {
      const response = await fetch(`${API_BASE}/parking-spaces/${id}`);
      const data = await response.json();
      setSpace(data);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching parking space:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/profile');
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parking_space_id: id,
          user_id: currentUser.id,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (response.ok) {
        setNewReview({ rating: 5, comment: '' });
        fetchParkingSpace(); // Refresh reviews
      }
    } catch (error) {
      console.error('Error adding review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCheckIn = () => {
    if (!currentUser) {
      navigate('/profile');
      return;
    }
    navigate('/qr-scanner', { state: { spaceId: id } });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading parking space details...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📍</div>
        <h3>Parking Space Not Found</h3>
        <p>This parking space doesn't exist or has been removed.</p>
        <button className="btn btn-primary" onClick={() => navigate('/find')}>
          ← Back to Search
        </button>
      </div>
    );
  }

  const getAvailabilityColor = (available, total) => {
    if (!total) return 'low';
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'high';
    if (percentage > 20) return 'medium';
    return 'low';
  };

  return (
    <div className="parking-detail">
      <div className="container">
        {/* Gallery */}
        <div className="parking-gallery">
          {space.space_type === 'ev' ? '🔋' : space.space_type === 'premium' ? '⭐' : '🅿️'}
        </div>

        {/* Header */}
        <div className="parking-header">
          <h1>{space.address}</h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>📍 {space.city}</p>

          {/* Info Grid */}
          <div className="parking-info-grid">
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div className="info-content">
                <h4>Location</h4>
                <p>{space.address}</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">👤</span>
              <div className="info-content">
                <h4>Owner</h4>
                <p>{space.owner_name}</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📱</span>
              <div className="info-content">
                <h4>Contact</h4>
                <p>{space.owner_phone}</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🏷️</span>
              <div className="info-content">
                <h4>Type</h4>
                <p>{space.space_type === 'ev' ? 'EV Charging' : space.space_type === 'premium' ? 'Premium' : 'Standard'}</p>
              </div>
            </div>
          </div>

          {/* Availability Grid */}
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Available Spots</h3>
          <div className="availability-grid">
            {space.car_spots > 0 && (
              <div className={`availability-card ${getAvailabilityColor(space.car_spots, 10)}`}>
                <div className="availability-label">🚗 Car Spots</div>
                <div className="availability-number">{space.car_spots}</div>
              </div>
            )}
            {space.bike_spots > 0 && (
              <div className={`availability-card ${getAvailabilityColor(space.bike_spots, 10)}`}>
                <div className="availability-label">🏍️ Bike Spots</div>
                <div className="availability-number">{space.bike_spots}</div>
              </div>
            )}
            {space.ev_spots > 0 && (
              <div className={`availability-card ${getAvailabilityColor(space.ev_spots, 10)}`}>
                <div className="availability-label">🔋 EV Spots</div>
                <div className="availability-number">{space.ev_spots}</div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Description */}
        <div className="grid grid-2">
          <div className="card">
            <h2>💰 Pricing</h2>
            <div style={{ marginTop: '1.5rem' }}>
              {space.car_spots > 0 && (
                <p style={{ marginBottom: '0.75rem' }}>
                  🚗 Car: <strong style={{ color: '#2563eb', fontSize: '1.25rem' }}>₹{space.car_price_per_hour}/hour</strong>
                </p>
              )}
              {space.bike_spots > 0 && (
                <p style={{ marginBottom: '0.75rem' }}>
                  🏍️ Bike: <strong style={{ color: '#2563eb', fontSize: '1.25rem' }}>₹{space.bike_price_per_hour}/hour</strong>
                </p>
              )}
              {space.ev_spots > 0 && (
                <p style={{ marginBottom: '0.75rem' }}>
                  🔋 EV: <strong style={{ color: '#2563eb', fontSize: '1.25rem' }}>₹{space.ev_price_per_hour}/hour</strong>
                </p>
              )}
            </div>
            <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', fontSize: '0.875rem', color: '#1e40af' }}>
              ℹ️ Minimum 1 hour charge. Rounded up to nearest hour.
            </div>
          </div>

          <div className="card">
            <h2>📝 Description</h2>
            <p style={{ marginTop: '1rem', color: '#4b5563' }}>
              {space.description || 'No description provided'}
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>⭐ Reviews ({reviews.length})</h2>
            {reviews.length > 0 && (
              <div style={{ fontSize: '1.5rem' }}>
                {'⭐'.repeat(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div style={{ marginTop: '1.5rem' }}>
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-author">{review.name}</span>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="review-stars">{'⭐'.repeat(review.rating)}</div>
                  <p className="review-text">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>No reviews yet. Be the first to review!</p>
          )}

          {currentUser && (
            <form onSubmit={handleAddReview} style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ marginBottom: '1rem' }}>📝 Add Your Review</h3>
              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                >
                  <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  <option value="4">⭐⭐⭐⭐ Good</option>
                  <option value="3">⭐⭐⭐ Average</option>
                  <option value="2">⭐⭐ Poor</option>
                  <option value="1">⭐ Very Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">Your Comment</label>
                <textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience with this parking space..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                {submittingReview ? '⏳ Submitting...' : '✅ Submit Review'}
              </button>
            </form>
          )}
        </div>

        {/* Booking Section */}
        <div style={{ marginBottom: '2rem', marginTop: '2rem' }}>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', padding: '1.5rem' }}
            onClick={handleCheckIn}
          >
            🚗 Book This Parking Space
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
            Ready to park? Click above to continue
          </p>
        </div>
      </div>
    </div>
  );
}

export default ParkingDetailPage;
