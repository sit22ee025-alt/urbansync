import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './pages.css';

const API_BASE = 'http://localhost:5000/api';

function PaymentPage({ currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Get checkout data passed from QRScannerPage
  const checkoutData = location.state?.checkoutData || {};
  const { sessionId, amount, duration } = checkoutData;

  useEffect(() => {
    if (!sessionId || !currentUser) {
        // Redirect if accessed directly without a session
       // navigate('/find');
    }
  }, [sessionId, currentUser, navigate]);

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: currentUser.id,
          amount: amount,
          payment_method: paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError(data.error || 'Payment failed');
      }
    } catch (err) {
      setError('Connection error');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="page-container">
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2>Payment Successful!</h2>
          <p>Thank you for using ParkHub.</p>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <h2 className="section-title">Payment Details</h2>
        <div className="payment-card">
            {error && <div className="error-message">{error}</div>}
          
          <div className="bill-summary" style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Duration</span>
              <strong>{duration} mins</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <span>Total Amount</span>
              <strong style={{ color: '#2563eb' }}>₹{amount}</strong>
            </div>
          </div>

          <h3 style={{ marginBottom: '1rem' }}>Select Payment Method</h3>
          <div className="payment-methods">
            <div 
              className={`payment-method ${paymentMethod === 'upi' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('upi')}
            >
              📱 UPI
            </div>
            <div 
              className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              💳 Card
            </div>
            <div 
              className={`payment-method ${paymentMethod === 'cash' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('cash')}
            >
              💵 Cash
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={handlePayment}
            disabled={processing || !sessionId}
          >
            {processing ? '⏳ Processing Payment...' : `✅ Pay ₹${amount || 0}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;