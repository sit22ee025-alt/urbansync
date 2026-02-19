const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./parking.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Initialize database tables
const initializeDatabase = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      vehicle_number TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS parking_spaces (
      id TEXT PRIMARY KEY,
      owner_name TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      owner_phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      space_type TEXT NOT NULL,
      total_spots INTEGER NOT NULL,
      available_spots INTEGER NOT NULL,
      car_spots INTEGER NOT NULL,
      bike_spots INTEGER NOT NULL,
      ev_spots INTEGER NOT NULL,
      car_price_per_hour DECIMAL(10,2) DEFAULT 20,
      bike_price_per_hour DECIMAL(10,2) DEFAULT 10,
      ev_price_per_hour DECIMAL(10,2) DEFAULT 30,
      images TEXT,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS parking_sessions (
      id TEXT PRIMARY KEY,
      parking_space_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      vehicle_number TEXT NOT NULL,
      check_in_time DATETIME NOT NULL,
      check_out_time DATETIME,
      duration_minutes INTEGER,
      amount_charged DECIMAL(10,2),
      payment_status TEXT DEFAULT 'pending',
      qr_code TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (parking_space_id) REFERENCES parking_spaces(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method TEXT,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES parking_sessions(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      parking_space_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parking_space_id) REFERENCES parking_spaces(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
};

initializeDatabase();

// Helper function to run database queries with promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// ==================== USER ROUTES ====================

// Register user
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, phone, vehicle_type, vehicle_number } = req.body;
    const id = uuidv4();

    await dbRun(
      'INSERT INTO users (id, name, email, phone, vehicle_type, vehicle_number) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, phone, vehicle_type, vehicle_number]
    );

    res.json({ success: true, userId: id, message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PARKING SPACE ROUTES ====================

// Create parking space
app.post('/api/parking-spaces', async (req, res) => {
  try {
    const {
      owner_name,
      owner_email,
      owner_phone,
      address,
      city,
      space_type,
      car_spots,
      bike_spots,
      ev_spots,
      description,
    } = req.body;

    const id = uuidv4();
    const total_spots = car_spots + bike_spots + ev_spots;

    await dbRun(
      `INSERT INTO parking_spaces 
       (id, owner_name, owner_email, owner_phone, address, city, space_type, 
        total_spots, available_spots, car_spots, bike_spots, ev_spots, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        owner_name,
        owner_email,
        owner_phone,
        address,
        city,
        space_type,
        total_spots,
        total_spots,
        car_spots,
        bike_spots,
        ev_spots,
        description,
      ]
    );

    res.json({ success: true, spaceId: id, message: 'Parking space created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all parking spaces
app.get('/api/parking-spaces', async (req, res) => {
  try {
    const { city, vehicle_type } = req.query;
    let sql = 'SELECT * FROM parking_spaces WHERE is_active = 1';
    let params = [];

    if (city) {
      sql += ' AND city = ?';
      params.push(city);
    }

    if (vehicle_type === 'car') {
      sql += ' AND car_spots > 0';
    } else if (vehicle_type === 'bike') {
      sql += ' AND bike_spots > 0';
    } else if (vehicle_type === 'ev') {
      sql += ' AND ev_spots > 0';
    }

    sql += ' LIMIT 50';
    const spaces = await dbAll(sql, params);
    res.json(spaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get parking space by ID
app.get('/api/parking-spaces/:id', async (req, res) => {
  try {
    const space = await dbGet('SELECT * FROM parking_spaces WHERE id = ?', [req.params.id]);
    if (space) {
      // Get reviews for this space
      const reviews = await dbAll(
        'SELECT r.*, u.name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.parking_space_id = ?',
        [req.params.id]
      );
      res.json({ ...space, reviews });
    } else {
      res.status(404).json({ error: 'Parking space not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update parking space
app.put('/api/parking-spaces/:id', async (req, res) => {
  try {
    const { address, city, description, car_spots, bike_spots, ev_spots } = req.body;
    const total_spots = car_spots + bike_spots + ev_spots;

    await dbRun(
      `UPDATE parking_spaces SET address = ?, city = ?, description = ?, 
       car_spots = ?, bike_spots = ?, ev_spots = ?, total_spots = ? WHERE id = ?`,
      [address, city, description, car_spots, bike_spots, ev_spots, total_spots, req.params.id]
    );

    res.json({ success: true, message: 'Parking space updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== PARKING SESSION ROUTES ====================

// Check-in: Start parking session
app.post('/api/sessions/check-in', async (req, res) => {
  try {
    const { parking_space_id, user_id, vehicle_type, vehicle_number } = req.body;

    // Verify parking space has available spots
    const space = await dbGet('SELECT * FROM parking_spaces WHERE id = ?', [parking_space_id]);
    if (!space) {
      return res.status(404).json({ error: 'Parking space not found' });
    }

    let available = false;
    if (vehicle_type === 'car' && space.car_spots > 0) available = true;
    else if (vehicle_type === 'bike' && space.bike_spots > 0) available = true;
    else if (vehicle_type === 'ev' && space.ev_spots > 0) available = true;

    if (!available) {
      return res.status(400).json({ error: `No ${vehicle_type} spots available` });
    }

    const session_id = uuidv4();
    const qr_code = `PARK-${session_id.substring(0, 8)}`;

    // Create session
    await dbRun(
      `INSERT INTO parking_sessions 
       (id, parking_space_id, user_id, vehicle_type, vehicle_number, check_in_time, qr_code, status) 
       VALUES (?, ?, ?, ?, ?, datetime('now'), ?, 'active')`,
      [session_id, parking_space_id, user_id, vehicle_type, vehicle_number, qr_code]
    );

    // Update available spots
    let spotColumn;
    if (vehicle_type === 'car') spotColumn = 'car_spots';
    else if (vehicle_type === 'bike') spotColumn = 'bike_spots';
    else spotColumn = 'ev_spots';

    await dbRun(`UPDATE parking_spaces SET ${spotColumn} = ${spotColumn} - 1, available_spots = available_spots - 1 WHERE id = ?`, [
      parking_space_id,
    ]);

    res.json({
      success: true,
      sessionId: session_id,
      qrCode: qr_code,
      message: 'Check-in successful',
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Check-out: End parking session and calculate charges
app.post('/api/sessions/check-out', async (req, res) => {
  try {
    const { session_id } = req.body;

    const session = await dbGet('SELECT * FROM parking_sessions WHERE id = ?', [session_id]);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session already completed' });
    }

    const space = await dbGet('SELECT * FROM parking_spaces WHERE id = ?', [session.parking_space_id]);

    // Calculate charges
    const checkInTime = new Date(session.check_in_time);
    const checkOutTime = new Date();
    const durationMinutes = Math.ceil((checkOutTime - checkInTime) / (1000 * 60));

    let pricePerHour;
    if (session.vehicle_type === 'car') pricePerHour = space.car_price_per_hour || 20;
    else if (session.vehicle_type === 'bike') pricePerHour = space.bike_price_per_hour || 10;
    else pricePerHour = space.ev_price_per_hour || 30;

    // Charge per hour (minimum 1 hour)
    const hours = Math.max(1, Math.ceil(durationMinutes / 60));
    const amountCharged = hours * pricePerHour;

    // Update session
    await dbRun(
      `UPDATE parking_sessions SET check_out_time = datetime('now'), duration_minutes = ?, 
       amount_charged = ?, payment_status = 'pending', status = 'completed' WHERE id = ?`,
      [durationMinutes, amountCharged, session_id]
    );

    // Free up parking spot
    let spotColumn;
    if (session.vehicle_type === 'car') spotColumn = 'car_spots';
    else if (session.vehicle_type === 'bike') spotColumn = 'bike_spots';
    else spotColumn = 'ev_spots';

    await dbRun(`UPDATE parking_spaces SET ${spotColumn} = ${spotColumn} + 1, available_spots = available_spots + 1 WHERE id = ?`, [
      session.parking_space_id,
    ]);

    res.json({
      success: true,
      duration: durationMinutes,
      amount: amountCharged,
      pricePerHour,
      message: 'Check-out successful',
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get active session
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await dbGet('SELECT * FROM parking_sessions WHERE id = ?', [req.params.id]);
    if (session) {
      res.json(session);
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's sessions
app.get('/api/users/:userId/sessions', async (req, res) => {
  try {
    const sessions = await dbAll(
      `SELECT ps.*, ps2.address, ps2.city 
       FROM parking_sessions ps
       JOIN parking_spaces ps2 ON ps.parking_space_id = ps2.id
       WHERE ps.user_id = ?
       ORDER BY ps.check_in_time DESC`,
      [req.params.userId]
    );
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PAYMENT ROUTES ====================

// Process payment
app.post('/api/payments', async (req, res) => {
  try {
    const { session_id, user_id, amount, payment_method } = req.body;

    const payment_id = uuidv4();

    await dbRun(
      `INSERT INTO payments (id, session_id, user_id, amount, payment_method, status) 
       VALUES (?, ?, ?, ?, ?, 'completed')`,
      [payment_id, session_id, user_id, amount, payment_method]
    );

    // Update session payment status
    await dbRun('UPDATE parking_sessions SET payment_status = ? WHERE id = ?', ['completed', session_id]);

    res.json({
      success: true,
      paymentId: payment_id,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get payment by ID
app.get('/api/payments/:id', async (req, res) => {
  try {
    const payment = await dbGet('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (payment) {
      res.json(payment);
    } else {
      res.status(404).json({ error: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== REVIEW ROUTES ====================

// Add review
app.post('/api/reviews', async (req, res) => {
  try {
    const { parking_space_id, user_id, rating, comment } = req.body;
    const id = uuidv4();

    await dbRun(
      `INSERT INTO reviews (id, parking_space_id, user_id, rating, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, parking_space_id, user_id, rating, comment]
    );

    res.json({ success: true, reviewId: id, message: 'Review added successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get reviews for parking space
app.get('/api/parking-spaces/:id/reviews', async (req, res) => {
  try {
    const reviews = await dbAll(
      'SELECT r.*, u.name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.parking_space_id = ?',
      [req.params.id]
    );
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ANALYTICS ROUTES ====================

// Get owner's parking space analytics
app.get('/api/analytics/owner/:email', async (req, res) => {
  try {
    const spaces = await dbAll('SELECT * FROM parking_spaces WHERE owner_email = ?', [req.params.email]);

    const analytics = [];
    for (const space of spaces) {
      const sessions = await dbAll('SELECT * FROM parking_sessions WHERE parking_space_id = ?', [space.id]);
      const completedSessions = sessions.filter((s) => s.status === 'completed');
      const totalRevenue = completedSessions.reduce((sum, s) => sum + (s.amount_charged || 0), 0);

      analytics.push({
        spaceId: space.id,
        address: space.address,
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        totalRevenue,
        averageSessionPrice: completedSessions.length > 0 ? totalRevenue / completedSessions.length : 0,
      });
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});