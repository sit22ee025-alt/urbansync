import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './pages.css';

const API_BASE = 'http://localhost:5000/api';

function QRScannerPage({ currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [qrCode, setQrCode] = useState('');
  // sessionId stores the ACTIVE session UUID from the backend
  const [sessionId, setSessionId] = useState(''); 
  const [parkingSpaceId, setParkingSpaceId] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Get space ID from navigation state (passed from ParkingDetailPage)
    const spaceId = location.state?.spaceId;
    if (spaceId && currentUser) {
      setParkingSpaceId(spaceId);
      // Generate a temporary visual QR for the UI
      const tempQr = `PARK-${spaceId.substring(0, 8).toUpperCase()}`;
      setQrCode(tempQr);
    }
  }, [location, currentUser]);

  const handleCheckIn = async () => {
    if (!currentUser || !parkingSpaceId) {
      setError('Missing user or parking space information');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/sessions/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parking_space_id: parkingSpaceId,
          user_id: currentUser.id,
          vehicle_type: currentUser.vehicle_type,
          vehicle_number: currentUser.vehicle_number
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Check-in successful! Timer started.');
        setIsCheckedIn(true);
        setSessionId(data.sessionId); // Store the actual session UUID
        setQrCode(data.qrCode); // Update QR to the session specific one
        
        // Store session in localStorage in case of refresh
        localStorage.setItem('currentSession', JSON.stringify({
          sessionId: data.sessionId,
          parkingSpaceId: parkingSpaceId,
          startTime: new Date().toISOString()
        }));
      } else {
        setError(data.error || 'Check-in failed');
      }
    } catch (err) {
      setError('Connection error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!sessionId) {
      setError('No active session found');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/sessions/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear local storage session
        localStorage.removeItem('currentSession');
        
        // Navigate to payment with the checkout details
        navigate('/payment', { 
          state: { 
            checkoutData: {
              sessionId: sessionId,
              amount: data.amount,
              duration: data.duration,
              pricePerHour: data.pricePerHour
            }
          }
        });
      } else {
        setError(data.error || 'Check-out failed');
      }
    } catch (err) {
      setError('Connection error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    navigate('/find');
  };

  if (!currentUser) {
    return (
      <div className="page-container">
        <div className="container">
          <p>Please log in to use the scanner.</p>
          <button className="btn btn-primary" onClick={() => navigate('/profile')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <h2 className="section-title">QR Check-in/out</h2>
        
        <div className="qr-card" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
          
          <div className="qr-placeholder" style={{ background: '#f3f4f6', padding: '2rem', marginBottom: '2rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {qrCode || 'Generating Code...'}
            </div>
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>
              {isCheckedIn ? 'Scan at exit to check out' : 'Scan at entry to check in'}
            </p>
          </div>

          {!isCheckedIn ? (
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleCheckIn}
              disabled={loading || !parkingSpaceId}
            >
              {loading ? '⏳ Processing...' : '📸 Confirm Check-In'}
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '1rem' }}
                onClick={handleCheckOut}
                disabled={loading}
              >
                {loading ? '⏳ Processing Checkout...' : '🚗 Check Out & Pay'}
              </button>
            </>
          )}
          
          <button
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={handleStartOver}
                disabled={loading}
              >
                ← Back to Parking Search
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRScannerPage;