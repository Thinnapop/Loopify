// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5175',
    'http://localhost:5173',
    'http://127.0.0.1:5175',
    'https://loopify-backend-sshh.onrender.com',
    'https://loopify-g41n.onrender.com',
    'https://thinnapop.github.io',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database successfully'))
  .catch(err => {
    console.error('❌ Database connection failed:', err.code, err.message);
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
  if (count >= 1000000) return `${Math.floor(count / 1000000)}M followers`;
  if (count >= 1000) return `${Math.floor(count / 1000)}K followers`;
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
app.get('/api/test/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 as test');
    res.json({
      message: 'Database connection successful',
      result: result.rows[0],
      database: process.env.DB_NAME || 'loopify_database'
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

app.get('/api/test/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    res.json({
      message: 'Users table exists',
      userCount: result.rows[0].count
    });
  } catch (error) {
    console.error('Users table test error:', error);
    res.status(500).json({
      error: 'Users table not found or accessible',
      details: error.message,
      hint: 'Run the PostgreSQL schema in your database'
    });
  }
});

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register', async (req, res) => {
  console.log('Register attempt:', req.body.email);
  try {
    const { displayName, email, password, country, language } = req.body;
    
    if (!displayName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existing = await pool.query(
      'SELECT "userId" FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'user_' + Date.now();

    await pool.query(
      `INSERT INTO users ("userId", "displayName", email, password, language, country, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')`,
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
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt:', req.body.email);
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const users = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (users.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users.rows[0];
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in successfully:', email);
    
    res.json({
      success: true,
      token,
      user: {
        userId: user.userId,
        displayName: user.displayName,
        email: user.email,
        country: user.country,
        language: user.language
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT "userId", "displayName", email, country, language, status FROM users WHERE "userId" = $1',
      [req.user.userId]
    );

    if (users.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users.rows[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ==================== SONGS ROUTES ====================
app.get('/api/songs/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(`
      SELECT COUNT(DISTINCT t."TrackID") as total
      FROM "Track" t
      JOIN "ArtistTrack" at ON t."TrackID" = at."TrackID"
      JOIN "Artist" a ON at."ArtistID" = a."ArtistID"
    `);
    
    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    const tracks = await pool.query(`
      SELECT 
        t."TrackID" as id,
        t."Title" as title,
        a."Name" as artist_name,
        t."CoverURL" as cover_image_url,
        t."DurationMs" as duration,
        t."Album" as album,
        t."Genre" as genre,
        COALESCE(SUM(uts."PlayCount"), 0) as play_count
      FROM "Track" t
      JOIN "ArtistTrack" at ON t."TrackID" = at."TrackID"
      JOIN "Artist" a ON at."ArtistID" = a."ArtistID"
      LEFT JOIN "UserTrackStat" uts ON t."TrackID" = uts."TrackID"
      GROUP BY t."TrackID", t."Title", a."Name", t."CoverURL", t."DurationMs", t."Album", t."Genre"
      ORDER BY play_count DESC, t."ReleaseDate" DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const formattedTracks = tracks.rows.map(track => ({
      ...track,
      duration: formatDuration(track.duration),
      cover_image_url: track.cover_image_url || `https://picsum.photos/200?random=${track.id}`
    }));
    
    res.json({
      data: formattedTracks,
      total: parseInt(total),
      page: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error('Trending songs error:', error);
    res.status(500).json({ error: 'Failed to fetch trending songs' });
  }
});

app.post('/api/songs/:songId/play', async (req, res) => {
  try {
    const { songId } = req.params;
    
    if (req.headers.authorization) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        try {
          const user = jwt.verify(token, JWT_SECRET);
          
          await pool.query(`
            INSERT INTO "UserTrackStat" ("UserID", "TrackID", "PlayCount", "LastEventAt") 
            VALUES ($1, $2, 1, NOW())
            ON CONFLICT ("UserID", "TrackID") 
            DO UPDATE SET 
              "PlayCount" = "UserTrackStat"."PlayCount" + 1, 
              "LastEventAt" = NOW()
          `, [user.userId, songId]);
          
          await pool.query(`
            INSERT INTO "Listening" ("UserID", "TrackID", "Device") 
            VALUES ($1, $2, 'web')
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
app.get('/api/artists/popular', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) as total FROM "Artist"');
    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    const artists = await pool.query(`
      SELECT 
        "ArtistID" as id,
        "Name" as name,
        "Country" as country,
        "Followers" as followers_count,
        "ImageURL" as avatar_url,
        "ArtistType" as type
      FROM "Artist"
      ORDER BY "Followers" DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const formattedArtists = artists.rows.map(artist => ({
      ...artist,
      type: artist.type === 'group' ? 'Group' : 'Artist',
      avatar_url: artist.avatar_url || `https://picsum.photos/200?random=${100 + artist.id}`
    }));
    
    res.json({
      data: formattedArtists,
      total: parseInt(total),
      page: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error('Popular artists error:', error);
    res.status(500).json({ error: 'Failed to fetch popular artists' });
  }
});

app.post('/api/artists/:artistId/follow', authenticateToken, async (req, res) => {
  try {
    const { artistId } = req.params;
    const { action } = req.body;
    
    if (action === 'follow') {
      await pool.query(
        'INSERT INTO "UserArtistFollow" ("UserID", "ArtistID", "AlertEnabled") VALUES ($1, $2, true)',
        [req.user.userId, artistId]
      );
      res.json({ message: 'Artist followed successfully' });
    } else {
      await pool.query(
        'DELETE FROM "UserArtistFollow" WHERE "UserID" = $1 AND "ArtistID" = $2',
        [req.user.userId, artistId]
      );
      res.json({ message: 'Artist unfollowed successfully' });
    }
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ error: 'Failed to update follow status' });
  }
});

// ==================== PLAYLIST ROUTES ====================
app.get('/api/playlists/collaborative', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        p."PlaylistID" as "playlistId",
        p."Title" as title,
        p."Description" as description,
        p."Visibility" as visibility,
        pm."Role" as "userRole",
        COUNT(DISTINCT pm2."UserID") as "memberCount",
        COUNT(DISTINCT pi."TrackID") as "trackCount"
      FROM "Playlist" p
      JOIN "PlaylistMember" pm ON p."PlaylistID" = pm."PlaylistID"
      LEFT JOIN "PlaylistMember" pm2 ON p."PlaylistID" = pm2."PlaylistID"
      LEFT JOIN "PlaylistItem" pi ON p."PlaylistID" = pi."PlaylistID"
      WHERE pm."UserID" = $1 AND p."Visibility" IN ('shared', 'public')
      GROUP BY p."PlaylistID", p."Title", p."Description", p."Visibility", pm."Role"
    `;
    
    const playlists = await pool.query(query, [req.user.userId]);
    res.json(playlists.rows);
  } catch (error) {
    console.error('Collaborative playlists error:', error);
    res.status(500).json({ error: 'Failed to fetch collaborative playlists' });
  }
});

app.get('/api/playlists/user', authenticateToken, async (req, res) => {
  try {
    console.log('📚 Fetching playlists for user:', req.user.userId);
    
    const query = `
      SELECT 
        p."PlaylistID" as "playlistId",
        p."Title" as title,
        p."Description" as description,
        p."Visibility" as visibility,
        pm."Role" as role,
        COUNT(DISTINCT pi."TrackID") as "trackCount"
      FROM "Playlist" p
      JOIN "PlaylistMember" pm ON p."PlaylistID" = pm."PlaylistID"
      LEFT JOIN "PlaylistItem" pi ON p."PlaylistID" = pi."PlaylistID"
      WHERE pm."UserID" = $1
      GROUP BY p."PlaylistID", p."Title", p."Description", p."Visibility", pm."Role"
      ORDER BY p."CreatedAt" DESC
    `;
    
    const playlists = await pool.query(query, [req.user.userId]);
    console.log('📚 Found playlists:', playlists.rows.length);
    
    res.json(playlists.rows);
  } catch (error) {
    console.error('❌ Fetch user playlists error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists', details: error.message });
  }
});

app.get('/api/playlists/:playlistId', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    console.log('🔍 Fetching playlist:', playlistId);
    
    const playlists = await pool.query(
      'SELECT * FROM "Playlist" WHERE "PlaylistID" = $1',
      [playlistId]
    );
    
    if (playlists.rows.length === 0) {
      console.log('❌ Playlist not found:', playlistId);
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    console.log('✅ Playlist found:', playlists.rows[0].Title);
    
    const memberRole = await pool.query(
      'SELECT "Role" FROM "PlaylistMember" WHERE "PlaylistID" = $1 AND "UserID" = $2',
      [playlistId, req.user.userId]
    );
    
    const members = await pool.query(
      `SELECT pm.*, u."displayName", u.email 
       FROM "PlaylistMember" pm
       JOIN users u ON pm."UserID" = u."userId"
       WHERE pm."PlaylistID" = $1`,
      [playlistId]
    );
    
    const tracks = await pool.query(`
      SELECT 
        pi."ListItemID",
        pi."Position",
        t."TrackID",
        t."Title",
        t."DurationMs",
        t."CoverURL",
        a."Name" as "ArtistName",
        u."displayName",
        pi."AddedAt"
       FROM "PlaylistItem" pi
       JOIN "Track" t ON pi."TrackID" = t."TrackID"
       JOIN "ArtistTrack" at ON t."TrackID" = at."TrackID"
       JOIN "Artist" a ON at."ArtistID" = a."ArtistID"
       JOIN users u ON pi."AddedByUserID" = u."userId"
       WHERE pi."PlaylistID" = $1
       ORDER BY pi."Position"`,
      [playlistId]
    );
    
    console.log('🎵 Tracks found:', tracks.rows.length);
    
    const playlist = playlists.rows[0];
    
    res.json({
      playlistId: playlist.PlaylistID,
      title: playlist.Title,
      description: playlist.Description,
      visibility: playlist.Visibility,
      role: memberRole.rows[0]?.Role || 'Viewer',
      members: members.rows,
      tracks: tracks.rows.map(t => ({
        id: t.TrackID,
        title: t.Title,
        artist: t.ArtistName,
        cover: t.CoverURL || `https://picsum.photos/200?random=${t.TrackID}`,
        duration: formatDuration(t.DurationMs),
        addedBy: t.displayName
      }))
    });
  } catch (error) {
    console.error('❌ Playlist details error:', error);
    res.status(500).json({ error: 'Failed to fetch playlist details' });
  }
});

app.post('/api/playlists/create', authenticateToken, async (req, res) => {
  try {
    const { title, description, visibility } = req.body;
    const playlistId = 'playlist_' + Date.now();
    
    console.log('📝 Creating playlist:', title, 'with ID:', playlistId);
    
    await pool.query(
      `INSERT INTO "Playlist" ("PlaylistID", "Title", "Description", "Visibility", "CreatorID") 
       VALUES ($1, $2, $3, $4, $5)`,
      [playlistId, title, description || '', visibility || 'private', req.user.userId]
    );
    
    await pool.query(
      `INSERT INTO "PlaylistMember" ("PlaylistID", "UserID", "Role") 
       VALUES ($1, $2, 'Owner')`,
      [playlistId, req.user.userId]
    );
    
    console.log('✅ Playlist created with ID:', playlistId);
    
    res.json({
      playlistId,
      title,
      description: description || '',
      visibility: visibility || 'private',
      message: 'Playlist created successfully'
    });
  } catch (error) {
    console.error('❌ Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist', details: error.message });
  }
});

app.post('/api/playlists/:playlistId/tracks', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId } = req.body;
    
    console.log('➕ Adding track:', trackId, 'to playlist:', playlistId);
    
    const member = await pool.query(
      'SELECT "Role" FROM "PlaylistMember" WHERE "PlaylistID" = $1 AND "UserID" = $2',
      [playlistId, req.user.userId]
    );
    
    if (member.rows.length === 0 || member.rows[0].Role === 'Viewer') {
      return res.status(403).json({ error: 'No permission to add tracks' });
    }
    
    const existing = await pool.query(
      'SELECT * FROM "PlaylistItem" WHERE "PlaylistID" = $1 AND "TrackID" = $2',
      [playlistId, trackId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Track already in playlist' });
    }
    
    const maxPos = await pool.query(
      'SELECT MAX("Position") as "maxPos" FROM "PlaylistItem" WHERE "PlaylistID" = $1',
      [playlistId]
    );
    
    const position = (maxPos.rows[0].maxPos || 0) + 1;
    const itemId = 'item_' + Date.now();
    
    await pool.query(
      `INSERT INTO "PlaylistItem" ("ListItemID", "PlaylistID", "TrackID", "AddedByUserID", "Position") 
       VALUES ($1, $2, $3, $4, $5)`,
      [itemId, playlistId, trackId, req.user.userId, position]
    );
    
    console.log('✅ Track added successfully');
    res.json({ message: 'Track added successfully', itemId });
  } catch (error) {
    console.error('❌ Add track error:', error);
    res.status(500).json({ error: 'Failed to add track', details: error.message });
  }
});

app.delete('/api/playlists/:playlistId/tracks/:trackId', authenticateToken, async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;
    
    const member = await pool.query(
      'SELECT "Role" FROM "PlaylistMember" WHERE "PlaylistID" = $1 AND "UserID" = $2',
      [playlistId, req.user.userId]
    );
    
    if (member.rows.length === 0 || member.rows[0].Role === 'Viewer') {
      return res.status(403).json({ error: 'No permission to remove tracks' });
    }
    
    await pool.query(
      'DELETE FROM "PlaylistItem" WHERE "PlaylistID" = $1 AND "TrackID" = $2',
      [playlistId, trackId]
    );
    
    res.json({ message: 'Track removed successfully' });
  } catch (error) {
    console.error('Remove track error:', error);
    res.status(500).json({ error: 'Failed to remove track' });
  }
});

// ==================== ALERTS ROUTES ====================
app.get('/api/alerts/pending', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        a."AlertID",
        a."Channel",
        a."State",
        a."CreatedAt",
        t."Title" as "TrackTitle",
        t."CoverURL",
        ar."Name" as "ArtistName"
      FROM "Alert" a
      JOIN "Track" t ON a."TrackID" = t."TrackID"
      JOIN "ArtistTrack" at ON t."TrackID" = at."TrackID"
      JOIN "Artist" ar ON at."ArtistID" = ar."ArtistID"
      WHERE a."UserID" = $1 AND a."State" = 'queued'
      ORDER BY a."CreatedAt" DESC
    `;
    
    const alerts = await pool.query(query, [req.user.userId]);
    res.json(alerts.rows);
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.put('/api/alerts/:alertId/read', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `UPDATE "Alert" SET "State" = 'sent', "DeliveredAt" = NOW() 
       WHERE "AlertID" = $1 AND "UserID" = $2`,
      [req.params.alertId, req.user.userId]
    );
    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// ==================== LEGACY ROUTES ====================
app.get('/api/tracks/trending', async (req, res) => {
  try {
    const query = `
      SELECT 
        t."TrackID" as id,
        t."Title" as title,
        a."Name" as artist,
        t."DurationMs" as duration,
        t."CoverURL" as cover,
        t."Album" as album,
        t."Genre" as genre
      FROM "Track" t
      JOIN "ArtistTrack" at ON t."TrackID" = at."TrackID"
      JOIN "Artist" a ON at."ArtistID" = a."ArtistID"
      ORDER BY t."ReleaseDate" DESC
      LIMIT 20
    `;
    
    const tracks = await pool.query(query);
    
    const formattedTracks = tracks.rows.map(track => ({
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
   GET  http://localhost:${PORT}/api/auth/profile

🎵 Music endpoints:
   GET  http://localhost:${PORT}/api/songs/trending
   GET  http://localhost:${PORT}/api/artists/popular
   GET  http://localhost:${PORT}/api/playlists/user
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});