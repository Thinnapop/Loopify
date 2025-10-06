// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// CORS configuration - MUST BE FIRST
const corsOptions = {
  origin: [
    'http://localhost:5175',
    'http://localhost:5173',
    'http://127.0.0.1:5175',
    'https://loopify-g41n.onrender.com',  // Your deployed frontend
    process.env.FRONTEND_URL  // Production frontend URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Create connection pool for better performance - AFTER CORS
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'project',
  password: process.env.DB_PASSWORD || 'Namozaza_1235',
  database: process.env.DB_NAME || 'loopify',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
  });

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// ==================== HELPER FUNCTIONS ====================
function formatDuration(ms) {
  if (!ms) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatFollowers(count) {
  if (count >= 1000000) {
    return `${Math.floor(count / 1000000)}M followers`;
  }
  if (count >= 1000) {
    return `${Math.floor(count / 1000)}K followers`;
  }
  return `${count} followers`;
}

// ==================== MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== TEST ENDPOINTS ====================
// Test endpoint to check database
app.get('/api/test/db', async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT 1 as test');
    res.json({ 
      message: 'Database connection successful', 
      result: result[0],
      database: process.env.DB_NAME || 'loopify'
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message,
      code: error.code
    });
  }
});

// Test endpoint to check if Users table exists
app.get('/api/test/users', async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT COUNT(*) as count FROM Users');
    res.json({ 
      message: 'Users table exists', 
      userCount: result[0].count
    });
  } catch (error) {
    console.error('Users table test error:', error);
    res.status(500).json({ 
      error: 'Users table not found or accessible',
      details: error.message,
      code: error.code,
      hint: 'Run: mysql -u project -p loopify < data.sql'
    });
  }
});

// ==================== AUTH ROUTES ====================
// Register
app.post('/api/auth/register', async (req, res) => {
  console.log('Register attempt:', req.body.email);
  try {
    const { displayName, email, password, country, language } = req.body;
    
    // Validate input
    if (!displayName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT UserID FROM Users WHERE Email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate user ID
    const userId = 'user_' + Date.now();
    
    // Insert user
    await pool.execute(
      `INSERT INTO Users (UserID, DisplayName, Email, Password, Language, Country, Status) 
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [userId, displayName, email, hashedPassword, language || 'en', country || 'Thailand']
    );
    
    // Generate token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('✅ User registered successfully:', email);
    
    res.json({
      success: true,
      token,
      user: {
        userId,
        displayName,
        email,
        country,
        language
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt:', req.body.email);
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Get user
    const [users] = await pool.execute(
      'SELECT * FROM Users WHERE Email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
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
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT UserID, DisplayName, Email, Country, Language, Status FROM Users WHERE UserID = ?',
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ==================== SONGS ROUTES ====================
// Get trending songs
app.get('/api/songs/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const [countResult] = await pool.execute(`
      SELECT COUNT(DISTINCT t.TrackID) as total
      FROM Track t
      JOIN ArtistTrack at ON t.TrackID = at.TrackID
      JOIN Artist a ON at.ArtistID = a.ArtistID
    `);
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get trending tracks with pagination
    const [tracks] = await pool.execute(`
      SELECT 
        t.TrackID as id,
        t.Title as title,
        a.Name as artist_name,
        t.CoverURL as cover_image_url,
        t.DurationMs as duration,
        t.Album as album,
        t.Genre as genre,
        COALESCE(SUM(uts.PlayCount), 0) as play_count
      FROM Track t
      JOIN ArtistTrack at ON t.TrackID = at.TrackID
      JOIN Artist a ON at.ArtistID = a.ArtistID
      LEFT JOIN UserTrackStat uts ON t.TrackID = uts.TrackID
      GROUP BY t.TrackID, t.Title, a.Name, t.CoverURL, t.DurationMs, t.Album, t.Genre
      ORDER BY play_count DESC, t.ReleaseDate DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    // Format tracks to match frontend expectations
    const formattedTracks = tracks.map(track => ({
      ...track,
      duration: formatDuration(track.duration),
      cover_image_url: track.cover_image_url || `https://picsum.photos/200?random=${track.id}`
    }));
    
    res.json({
      data: formattedTracks,
      total: total,
      page: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error('Trending songs error:', error);
    res.status(500).json({ error: 'Failed to fetch trending songs' });
  }
});

// Track song play
app.post('/api/songs/:songId/play', async (req, res) => {
  try {
    const { songId } = req.params;
    
    // If user is authenticated, update their stats
    if (req.headers.authorization) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        try {
          const user = jwt.verify(token, JWT_SECRET);
          
          // Update or insert user track stats
          await pool.execute(`
            INSERT INTO UserTrackStat (UserID, TrackID, PlayCount, LastEventAt) 
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE 
            PlayCount = PlayCount + 1, 
            LastEventAt = NOW()
          `, [user.userId, songId]);
          
          // Add to listening history
          await pool.execute(`
            INSERT INTO Listening (UserID, TrackID, Device) 
            VALUES (?, ?, 'web')
          `, [user.userId, songId]);
        } catch (jwtError) {
          console.log('Invalid token for play tracking:', jwtError.message);
        }
      }
    }
    
    res.json({ message: 'Play tracked successfully' });
  } catch (error) {
    console.error('Play song error:', error);
    res.status(500).json({ error: 'Failed to track song play' });
  }
});

// ==================== ARTISTS ROUTES ====================
// Get popular artists
app.get('/api/artists/popular', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM Artist');
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get popular artists with pagination
    const [artists] = await pool.execute(`
      SELECT 
        ArtistID as id,
        Name as name,
        Country as country,
        Followers as followers_count,
        ImageURL as avatar_url,
        ArtistType as type
      FROM Artist
      ORDER BY Followers DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    // Format artists to match frontend expectations
    const formattedArtists = artists.map(artist => ({
      ...artist,
      type: artist.type === 'group' ? 'Group' : 'Artist',
      avatar_url: artist.avatar_url || `https://picsum.photos/200?random=${100 + artist.id}`
    }));
    
    res.json({
      data: formattedArtists,
      total: total,
      page: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error('Popular artists error:', error);
    res.status(500).json({ error: 'Failed to fetch popular artists' });
  }
});

// Follow/Unfollow artist
app.post('/api/artists/:artistId/follow', authenticateToken, async (req, res) => {
  try {
    const { artistId } = req.params;
    const { action } = req.body;
    
    if (action === 'follow') {
      await pool.execute(
        'INSERT INTO UserArtistFollow (UserID, ArtistID, AlertEnabled) VALUES (?, ?, true)',
        [req.user.userId, artistId]
      );
      res.json({ message: 'Artist followed successfully' });
    } else {
      await pool.execute(
        'DELETE FROM UserArtistFollow WHERE UserID = ? AND ArtistID = ?',
        [req.user.userId, artistId]
      );
      res.json({ message: 'Artist unfollowed successfully' });
    }
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ error: 'Failed to update follow status' });
  }
});

// ==================== COLLABORATIVE PLAYLIST ROUTES ====================
// Get user's collaborative playlists
app.get('/api/playlists/collaborative', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        p.PlaylistID as playlistId,
        p.Title as title,
        p.Description as description,
        p.Visibility as visibility,
        pm.Role as userRole,
        COUNT(DISTINCT pm2.UserID) as memberCount,
        COUNT(DISTINCT pi.TrackID) as trackCount
      FROM Playlist p
      JOIN PlaylistMember pm ON p.PlaylistID = pm.PlaylistID
      LEFT JOIN PlaylistMember pm2 ON p.PlaylistID = pm2.PlaylistID
      LEFT JOIN PlaylistItem pi ON p.PlaylistID = pi.PlaylistID
      WHERE pm.UserID = ? AND p.Visibility IN ('shared', 'public')
      GROUP BY p.PlaylistID, p.Title, p.Description, p.Visibility, pm.Role
    `;
    
    const [playlists] = await pool.execute(query, [req.user.userId]);
    res.json(playlists);
  } catch (error) {
    console.error('Collaborative playlists error:', error);
    res.status(500).json({ error: 'Failed to fetch collaborative playlists' });
  }
});

// Get playlist details with tracks and members
app.get('/api/playlists/:playlistId', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    // Get playlist info
    const [playlists] = await pool.execute(
      'SELECT * FROM Playlist WHERE PlaylistID = ?',
      [playlistId]
    );
    
    if (playlists.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    // Get members
    const [members] = await pool.execute(
      `SELECT pm.*, u.DisplayName, u.Email 
       FROM PlaylistMember pm
       JOIN Users u ON pm.UserID = u.UserID
       WHERE pm.PlaylistID = ?`,
      [playlistId]
    );
    
    // Get tracks
    const [tracks] = await pool.execute(
      `SELECT 
        pi.ListItemID,
        pi.Position,
        t.TrackID,
        t.Title,
        t.DurationMs,
        t.CoverURL,
        a.Name as ArtistName,
        u.DisplayName as AddedBy,
        pi.AddedAt
       FROM PlaylistItem pi
       JOIN Track t ON pi.TrackID = t.TrackID
       JOIN ArtistTrack at ON t.TrackID = at.TrackID
       JOIN Artist a ON at.ArtistID = a.ArtistID
       JOIN Users u ON pi.AddedByUserID = u.UserID
       WHERE pi.PlaylistID = ?
       ORDER BY pi.Position`,
      [playlistId]
    );
    
    res.json({
      ...playlists[0],
      members,
      tracks: tracks.map(t => ({
        ...t,
        duration: formatDuration(t.DurationMs)
      }))
    });
  } catch (error) {
    console.error('Playlist details error:', error);
    res.status(500).json({ error: 'Failed to fetch playlist details' });
  }
});

// Create collaborative playlist
app.post('/api/playlists/create', authenticateToken, async (req, res) => {
  try {
    const { title, description, visibility } = req.body;
    const playlistId = 'playlist_' + Date.now();
    
    // Create playlist
    await pool.execute(
      `INSERT INTO Playlist (PlaylistID, Title, Description, Visibility, CreatorID) 
       VALUES (?, ?, ?, ?, ?)`,
      [playlistId, title, description, visibility || 'shared', req.user.userId]
    );
    
    // Add creator as owner
    await pool.execute(
      `INSERT INTO PlaylistMember (PlaylistID, UserID, Role) 
       VALUES (?, ?, 'owner')`,
      [playlistId, req.user.userId]
    );
    
    res.json({
      playlistId,
      title,
      description,
      visibility,
      message: 'Playlist created successfully'
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Add track to playlist
app.post('/api/playlists/:playlistId/tracks', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId } = req.body;
    
    // Check if user has permission
    const [member] = await pool.execute(
      'SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?',
      [playlistId, req.user.userId]
    );
    
    if (member.length === 0 || member[0].Role === 'viewer') {
      return res.status(403).json({ error: 'No permission to add tracks' });
    }
    
    // Get max position
    const [maxPos] = await pool.execute(
      'SELECT MAX(Position) as maxPos FROM PlaylistItem WHERE PlaylistID = ?',
      [playlistId]
    );
    
    const position = (maxPos[0].maxPos || 0) + 1;
    const itemId = 'item_' + Date.now();
    
    // Add track
    await pool.execute(
      `INSERT INTO PlaylistItem (ListItemID, PlaylistID, TrackID, AddedByUserID, Position) 
       VALUES (?, ?, ?, ?, ?)`,
      [itemId, playlistId, trackId, req.user.userId, position]
    );
    
    res.json({ message: 'Track added successfully', itemId });
  } catch (error) {
    console.error('Add track error:', error);
    res.status(500).json({ error: 'Failed to add track' });
  }
});

// ==================== ALERTS ROUTES ====================
// Get user's alerts
app.get('/api/alerts/pending', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        a.AlertID,
        a.Channel,
        a.State,
        a.CreatedAt,
        t.Title as TrackTitle,
        t.CoverURL,
        ar.Name as ArtistName
      FROM Alert a
      JOIN Track t ON a.TrackID = t.TrackID
      JOIN ArtistTrack at ON t.TrackID = at.TrackID
      JOIN Artist ar ON at.ArtistID = ar.ArtistID
      WHERE a.UserID = ? AND a.State = 'queued'
      ORDER BY a.CreatedAt DESC
    `;
    
    const [alerts] = await pool.execute(query, [req.user.userId]);
    res.json(alerts);
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Mark alert as read
app.put('/api/alerts/:alertId/read', authenticateToken, async (req, res) => {
  try {
    await pool.execute(
      `UPDATE Alert SET State = 'sent', DeliveredAt = NOW() 
       WHERE AlertID = ? AND UserID = ?`,
      [req.params.alertId, req.user.userId]
    );
    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// ==================== LEGACY ROUTES ====================
// Get trending tracks (legacy endpoint)
app.get('/api/tracks/trending', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.TrackID as id,
        t.Title as title,
        a.Name as artist,
        t.DurationMs as duration,
        t.CoverURL as cover,
        t.Album as album,
        t.Genre as genre
      FROM Track t
      JOIN ArtistTrack at ON t.TrackID = at.TrackID
      JOIN Artist a ON at.ArtistID = a.ArtistID
      ORDER BY t.ReleaseDate DESC
      LIMIT 20
    `;
    
    const [tracks] = await pool.execute(query);
    
    const formattedTracks = tracks.map(track => ({
      ...track,
      duration: formatDuration(track.duration)
    }));
    
    res.json(formattedTracks);
  } catch (error) {
    console.error('Trending tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch trending tracks' });
  }
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`
🚀 Loopify Server is running!
📍 URL: http://localhost:${PORT}
📊 Database: ${process.env.DB_NAME || 'loopify'}

✅ Test endpoints:
   GET  http://localhost:${PORT}/api/test/db
   GET  http://localhost:${PORT}/api/test/users
   
📝 Auth endpoints:
   POST http://localhost:${PORT}/api/auth/register
   POST http://localhost:${PORT}/api/auth/login
   GET  http://localhost:${PORT}/api/auth/Profile

🎵 Music endpoints:
   GET  http://localhost:${PORT}/api/songs/trending
   GET  http://localhost:${PORT}/api/artists/popular
   GET  http://localhost:${PORT}/api/playlists/collaborative
  `);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});