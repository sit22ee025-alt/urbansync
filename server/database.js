const sqlite3 = require('sqlite3').verbose();

// Connect to a file-based database
const db = new sqlite3.Database('./parking.db', (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // 1. Create Parking Spots Table
        db.run(`CREATE TABLE IF NOT EXISTS spots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            type TEXT, -- 'car' or 'bike'
            is_ev BOOLEAN,
            rate_per_hour INTEGER,
            ev_surcharge INTEGER,
            is_occupied BOOLEAN DEFAULT 0
        )`, () => {
            // Seed some fake data so the app isn't empty
            db.run(`INSERT OR IGNORE INTO spots (id, name, type, is_ev, rate_per_hour, ev_surcharge) VALUES 
                (1, 'Green Villa Driveway', 'car', 1, 20, 15),
                (2, 'Sharma Household', 'bike', 0, 10, 0),
                (3, 'City Center Backyard', 'car', 0, 20, 0)
            `);
        });

        // 2. Create Transactions Table (For Parking Sessions)
        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            spot_id INTEGER,
            entry_time TEXT,
            exit_time TEXT,
            total_cost REAL,
            status TEXT DEFAULT 'active' -- 'active' or 'completed'
        )`);
    }
});

module.exports = db;