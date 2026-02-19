import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import all page components
import HomePage from './pages/HomePage';
import FindParkingPage from './pages/FindParkingPage';
import ParkingDetailPage from './pages/ParkingDetailPage';
import ListYourSpacePage from './pages/ListYourSpacePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import QRScannerPage from './pages/QRScannerPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    // Check for user in localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setNavigationOpen(false);
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-container">
            <Link to="/" className="logo">
              <div className="logo-icon">P</div>
              <div className="logo-text">
                <div className="logo-main">Urban sync</div>
                <div className="logo-sub">Smart Parking</div>
              </div>
            </Link>

            <nav className={`nav-menu ${navigationOpen ? 'active' : ''}`}>
              <Link to="/find" className="nav-link">Find Parking</Link>
              <Link to="/list-space" className="nav-link">List Your Space</Link>

              {currentUser ? (
                <>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/profile" className="nav-link">Profile</Link>
                  <button onClick={handleLogout} className="btn-logout">Logout</button>
                </>
              ) : (
                <Link to="/profile" className="btn-primary">Sign In</Link>
              )}
            </nav>

            <button
              className="hamburger"
              onClick={() => setNavigationOpen(!navigationOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage currentUser={currentUser} />} />
            <Route path="/find" element={<FindParkingPage currentUser={currentUser} />} />
            <Route path="/parking/:id" element={<ParkingDetailPage currentUser={currentUser} />} />
            <Route path="/list-space" element={<ListYourSpacePage />} />
            <Route path="/dashboard" element={<DashboardPage currentUser={currentUser} />} />
            <Route path="/profile" element={<ProfilePage setCurrentUser={setCurrentUser} />} />
            <Route path="/payment" element={<PaymentPage currentUser={currentUser} />} />
            <Route path="/qr-scanner" element={<QRScannerPage currentUser={currentUser} />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>ParkHub</h4>
              <p>Smart Parking Solutions for Congested Areas</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/find">Find Parking</Link></li>
                <li><Link to="/list-space">List Space</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: info@parkhub.com</p>
              <p>Phone: +91 1234-567890</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ParkHub. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;