import React from 'react';
import { Link } from 'react-router-dom';
import './pages.css';

function HomePage({ currentUser }) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Find Your Perfect Parking Space</h1>
            <p className="hero-subtitle">
              Smart parking solutions for congested urban areas. Earn money by renting
              your unused parking space or find convenient parking in your neighborhood.
            </p>
            <div className="hero-cta">
              <Link to="/find" className="btn btn-primary btn-lg">
                🔍 Find Parking Now
              </Link>
              <Link to="/list-space" className="btn btn-outline btn-lg">
                📍 List Your Space
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-graphic">
              <div className="parking-grid">
                <div className="spot available"></div>
                <div className="spot occupied"></div>
                <div className="spot available"></div>
                <div className="spot occupied"></div>
                <div className="spot available"></div>
                <div className="spot occupied"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🚗</div>
              <div className="stat-number">15,000+</div>
              <div className="stat-label">Parking Spaces</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-number">50,000+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-number">4.8/5</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-number">₹2.5 Cr+</div>
              <div className="stat-label">Earned by Owners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose ParkHub?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Booking</h3>
              <p>Find and book parking spaces in seconds with our intuitive mobile-first platform.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payment</h3>
              <p>Safe and secure QR-based payment system. Pay only for the time you park.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔋</div>
              <h3>EV Charging</h3>
              <p>Dedicated parking spaces for electric vehicles with charging facilities available.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Smart QR Scan</h3>
              <p>Check-in and check-out with simple QR code scanning. Real-time billing included.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💵</div>
              <h3>Earn Money</h3>
              <p>Transform your unused parking space into a reliable income stream.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics</h3>
              <p>Track your earnings and parking space performance with detailed analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <h2 className="section-title">Transparent Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>🚗 Car Parking</h3>
                <div className="price">₹50<span>/hour</span></div>
              </div>
              <ul className="pricing-features">
                <li>✓ Standard parking spaces</li>
                <li>✓ Covered or open air</li>
                <li>✓ Real-time booking</li>
                <li>✓ Owner availability</li>
              </ul>
            </div>
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>🏍️ Bike Parking</h3>
                <div className="price">₹30<span>/hour</span></div>
              </div>
              <ul className="pricing-features">
                <li>✓ Secure bike spaces</li>
                <li>✓ Weather protected</li>
                <li>✓ Quick booking</li>
                <li>✓ Affordable rates</li>
              </ul>
            </div>
            <div className="pricing-card premium">
              <div className="pricing-header">
                <h3>🔋 EV Charging</h3>
                <div className="price">₹20<span>/Unit</span></div>
              </div>
              <ul className="pricing-features">
                <li>✓ EV dedicated spaces</li>
                <li>✓ Charging stations</li>
                <li>✓ Priority booking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Search & Find</h3>
              <p>Search for available parking spaces near your location</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Book & Confirm</h3>
              <p>Book your preferred spot with just one click</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>QR Check-in</h3>
              <p>Scan the QR code at the parking space to check in</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Pay & Leave</h3>
              <p>Scan to check out and pay only for the time used</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Smart Parking?</h2>
            <p>Join thousands of users who save time and money with ParkHub</p>
            {currentUser ? (
              <Link to="/find" className="btn btn-primary btn-lg">
                Find Parking Now →
              </Link>
            ) : (
              <Link to="/profile" className="btn btn-primary btn-lg">
                Get Started Today →
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
