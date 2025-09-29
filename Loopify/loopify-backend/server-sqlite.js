const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5175', 'http://localhost:5173', 'http://127.0.0.1:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// SQLite database connection
let db;

(async () => {
  db = await open({
    filename: './loopify.db',
    driver: sqlite3.Database
  });

  console.log('✅ Connected to SQLite database successfully');

  // Create Users table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      UserID TEXT PRIMARY KEY,
      DisplayName TEXT NOT NULL,
      Email TEXT UNIQUE NOT NULL,
      Password TEXT NOT NULL,
      Language TEXT DEFAULT 'en',
      Country TEXT,
      Status TEXT DEFAULT 'active',
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Users table ready');
})();
// Add this to your server-sqlite.js database initialization
await db.exec(`
  CREATE TABLE IF NOT EXISTS UserStats (
    UserID TEXT PRIMARY KEY,
    PlaylistCount INTEGER DEFAULT 0,
    FollowerCount INTEGER DEFAULT 0,
    FollowingCount INTEGER DEFAULT 0,
    MinutesListened INTEGER DEFAULT 0,
    SongsLiked INTEGER DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
  )
`);

// Initialize stats when user registers
app.post('/api/auth/register', async (req, res) => {
  // ... existing registration code ...
  
  // After creating user, initialize their stats
  await db.run(
    'INSERT INTO UserStats (UserID) VALUES (?)',
    [userId]
  );
  
  // ... rest of the code
});

// Add endpoint to get user stats
app.get('/api/user/stats', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const stats = await db.get(
      'SELECT * FROM UserStats WHERE UserID = ?',
      [decoded.userId]
    );
    
    res.json(stats || {
      PlaylistCount: 0,
      FollowerCount: 0,
      FollowingCount: 0,
      MinutesListened: 0,
      SongsLiked: 0
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  console.log('Register attempt:', req.body.email);
  try {
    const { displayName, email, password, country, language } = req.body;
    
    if (!displayName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'user_' + Date.now();
    
    await db.run(
      `INSERT INTO Users (UserID, DisplayName, Email, Password, Language, Country) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, displayName, email, hashedPassword, language || 'en', country || 'Thailand']
    );
    
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('✅ User registered successfully:', email);
    
    res.json({
      success: true,
      token,
      user: { userId, displayName, email, country, language }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt:', req.body.email);
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await db.get('SELECT * FROM Users WHERE Email = ?', [email]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.UserID, email: user.Email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in successfully:', email);
    
    res.json({
      success: true,
      token,
      user: {
        userId: user.UserID,
        displayName: user.DisplayName,
        email: user.Email,
        country: user.Country,
        language: user.Language
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Get user profile endpoint
app.get('/api/auth/profile', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch user from database
    const user = await db.get(
      'SELECT UserID, DisplayName, Email, Country, Status, CreatedAt FROM Users WHERE UserID = ?',
      [decoded.userId]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      userId: user.UserID,
      displayName: user.DisplayName,
      email: user.Email,
      country: user.Country,
      status: user.Status,
      createdAt: user.CreatedAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
});
// Test endpoint
app.get('/api/test/db', async (req, res) => {
  try {
    const users = await db.all('SELECT COUNT(*) as count FROM Users');
    res.json({ 
      message: 'Database connection successful', 
      userCount: users[0].count,
      database: 'SQLite (loopify.db)'
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Loopify Server is running with SQLite!
📍 URL: http://localhost:${PORT}
📊 Database: SQLite (no authentication needed!)

✅ Test endpoints:
   GET  http://localhost:${PORT}/api/test/db
   POST http://localhost:${PORT}/api/auth/register
   POST http://localhost:${PORT}/api/auth/login
  `);
});
