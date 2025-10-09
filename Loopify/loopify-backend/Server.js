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
    'http://localhost:5174',
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
// Add RIGHT AFTER your existing test endpoints (around line 100)

app.get('/api/test/track-columns', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'track'
      ORDER BY ordinal_position
    `);
    res.json({ 
      columns: result.rows
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message
    });
  }
});

app.get('/api/test/sample-track', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM track LIMIT 1');
    if (result.rows.length > 0) {
      res.json({ 
        success: true,
        columnNames: Object.keys(result.rows[0]),
        sampleData: result.rows[0]
      });
    } else {
      res.json({ success: false, message: 'No tracks found' });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      code: error.code
    });
  }
});

// ==================== IMPORT TRACKS FROM EXTERNAL API ====================
app.post('/api/tracks/import-from-jamendo', async (req, res) => {
  try {
    const { tracks } = req.body; // Array of track objects from Jamendo
    
    console.log(`📥 Importing ${tracks.length} tracks from Jamendo...`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const track of tracks) {
      try {
        // Check if track already exists
        const existing = await pool.query(
          'SELECT "trackid" FROM track WHERE "trackid" = $1',
          [track.id.toString()]
        );
        
        if (existing.rows.length > 0) {
          skipped++;
          continue;
        }
        
        // Insert track
        await pool.query(
          `INSERT INTO track ("trackid", "title", "durationms", "album", "genre", "coverurl", "releasedate")
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT ("trackid") DO NOTHING`,
          [
            track.id.toString(),
            track.title,
            track.duration * 1000 || 180000, // Convert seconds to ms
            track.album || 'Unknown Album',
            track.genre || 'Unknown',
            track.cover
          ]
        );
        
        // Check if artist exists, if not create it
        const artistExists = await pool.query(
          'SELECT "artistid" FROM artist WHERE "name" = $1',
          [track.artist]
        );
        
        let artistId;
        if (artistExists.rows.length === 0) {
          artistId = 'artist_jamendo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          await pool.query(
            `INSERT INTO artist ("artistid", "name", "country", "debutyear", "followers", "artisttype")
             VALUES ($1, $2, 'Unknown', 2020, 0, 'person')
             ON CONFLICT DO NOTHING`,
            [artistId, track.artist]
          );
        } else {
          artistId = artistExists.rows[0].artistid;
        }
        
        // Create artist-track relationship
        await pool.query(
          `INSERT INTO artisttrack ("artistid", "trackid", "role")
           VALUES ($1, $2, 'primary')
           ON CONFLICT DO NOTHING`,
          [artistId, track.id.toString()]
        );
        
        imported++;
      } catch (error) {
        console.error(`Failed to import track ${track.id}:`, error.message);
      }
    }
    
    console.log(`✅ Import complete: ${imported} imported, ${skipped} skipped`);
    res.json({ 
      success: true, 
      imported, 
      skipped,
      message: `Successfully imported ${imported} tracks!` 
    });
    
  } catch (error) {
    console.error('Import tracks error:', error);
    res.status(500).json({ error: 'Failed to import tracks', details: error.message });
  }
});

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register', async (req, res) => {
  console.log('Register attempt:', req.body.email);
  try {
    const { displayName, email, password, country, language, sex } = req.body;
    
    if (!displayName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existing = await pool.query(
      'SELECT "userid" FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 🆕 Generate sequential user ID with better error handling
    try {
      // Only get users with the new format (user_001, user_002, etc.)
      // that are exactly 8 characters long (user_XXX)
      const lastUserResult = await pool.query(
        `SELECT "userid" FROM users 
         WHERE "userid" ~ '^user_[0-9]{3}$'
         ORDER BY CAST(SUBSTRING("userid" FROM 6) AS INTEGER) DESC
         LIMIT 1`
      );
      
      let nextNumber = 1;
      if (lastUserResult.rows.length > 0) {
        const lastUserId = lastUserResult.rows[0].userid;
        const lastNumber = parseInt(lastUserId.replace('user_', ''), 10);
        nextNumber = lastNumber + 1;
        console.log('📊 Last user number:', lastNumber, '→ Next:', nextNumber);
      } else {
        console.log('📊 No sequential users found, starting from user_001');
      }
      
      // Format with leading zeros: user_001, user_002, etc.
      const userId = `user_${String(nextNumber).padStart(3, '0')}`;
      console.log('✅ Generated userId:', userId);

      await pool.query(
        `INSERT INTO users ("userid", "displayname", email, password, language, country, sex, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')`,
        [userId, displayName, email, hashedPassword, language || 'en', country || 'Thailand', sex]
      );
      
      const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
      
      console.log('✅ User registered:', email, 'with ID:', userId);
      
      res.json({
        success: true,
        token,
        user: { userId, displayName, email, country, language, sex }
      });
      
    } catch (userIdError) {
      console.error('❌ User ID generation error:', userIdError);
      // Fallback to timestamp-based ID if sequential fails
      const fallbackUserId = 'user_' + Date.now();
      console.log('⚠️ Using fallback ID:', fallbackUserId);
      
      await pool.query(
        `INSERT INTO users ("userid", "displayname", email, password, language, country, sex, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')`,
        [fallbackUserId, displayName, email, hashedPassword, language || 'en', country || 'Thailand', sex]
      );
      
      const token = jwt.sign({ userId: fallbackUserId, email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({
        success: true,
        token,
        user: { userId: fallbackUserId, displayName, email, country, language, sex }
      });
    }
    
  } catch (error) {
    console.error('❌ Register error:', error);
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
      { userId: user.userid, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in successfully:', email);
    
    res.json({
      success: true,
      token,
      user: {
        userId: user.userid,
        displayName: user.displayname,
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
      'SELECT "userid", "displayname", email, country, language, sex, status FROM users WHERE "userid" = $1',
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
      SELECT COUNT(DISTINCT t."trackid") as total
      FROM track t
      JOIN artisttrack at ON t."trackid" = at."trackid"
      JOIN artist a ON at."artistid" = a."artistid"
    `);
    
    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    const tracks = await pool.query(`
      SELECT 
        t."trackid" as id,
        t."title" as title,
        a."name" as artist_name,
        t."coverurl" as cover_image_url,
        t."durationms" as duration,
        t."album" as album,
        t."genre" as genre,
        COALESCE(SUM(uts."playcount"), 0) as play_count
      FROM track t
      JOIN artisttrack at ON t."trackid" = at."trackid"
      JOIN artist a ON at."artistid" = a."artistid"
      LEFT JOIN usertrackstat uts ON t."trackid" = uts."trackid"
      GROUP BY t."trackid", t."title", a."name", t."coverurl", t."durationms", t."album", t."genre"
      ORDER BY play_count DESC, t."releasedate" DESC
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
            INSERT INTO usertrackstat ("userid", "trackid", "playcount", "lasteventat") 
            VALUES ($1, $2, 1, NOW())
            ON CONFLICT ("userid", "trackid") 
            DO UPDATE SET 
              "playcount" = usertrackstat."playcount" + 1, 
              "lasteventat" = NOW()
          `, [user.userId, songId]);
          
          await pool.query(`
            INSERT INTO listening ("userid", "trackid", "device") 
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

    const countResult = await pool.query('SELECT COUNT(*) as total FROM artist');
    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    const artists = await pool.query(`
      SELECT 
        "artistid" as id,
        "name" as name,
        "country" as country,
        "followers" as followers_count,
        "imageurl" as avatar_url,
        "artisttype" as type
      FROM artist
      ORDER BY "followers" DESC
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
        'INSERT INTO userartistfollow ("userid", "artistid", "alertenabled") VALUES ($1, $2, true)',
        [req.user.userId, artistId]
      );
      res.json({ message: 'Artist followed successfully' });
    } else {
      await pool.query(
        'DELETE FROM userartistfollow WHERE "userid" = $1 AND "artistid" = $2',
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
        p."playlistid" as "playlistId",
        p."title" as title,
        p."description" as description,
        p."visibility" as visibility,
        pm."role" as "userRole",
        COUNT(DISTINCT pm2."userid") as "memberCount",
        COUNT(DISTINCT pi."trackid") as "trackCount"
      FROM playlist p
      JOIN playlistmember pm ON p."playlistid" = pm."playlistid"
      LEFT JOIN playlistmember pm2 ON p."playlistid" = pm2."playlistid"
      LEFT JOIN playlistitem pi ON p."playlistid" = pi."playlistid"
      WHERE pm."userid" = $1 AND p."visibility" IN ('shared', 'public')
      GROUP BY p."playlistid", p."title", p."description", p."visibility", pm."role"
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
        p."playlistid" as "playlistId",
        p."title" as title,
        p."description" as description,
        p."visibility" as visibility,
        pm."role" as role,
        COUNT(DISTINCT pi."trackid") as "trackCount"
      FROM playlist p
      JOIN playlistmember pm ON p."playlistid" = pm."playlistid"
      LEFT JOIN playlistitem pi ON p."playlistid" = pi."playlistid"
      WHERE pm."userid" = $1
      GROUP BY p."playlistid", p."title", p."description", p."visibility", pm."role"
      ORDER BY p."createdat" DESC
    `;
    
    const playlists = await pool.query(query, [req.user.userId]);
    console.log('📚 Found playlists:', playlists.rows.length);
    
    res.json(playlists.rows);
  } catch (error) {
    console.error('❌ Fetch user playlists error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists', details: error.message });
  }
});

app.put('/api/playlists/:playlistId', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { title, description, visibility } = req.body;
    
    console.log('✏️ Updating playlist:', playlistId);
    
    // Check if user has permission (owner or editor)
    const member = await pool.query(
      'SELECT "role" FROM playlistmember WHERE "playlistid" = $1 AND "userid" = $2',
      [playlistId, req.user.userId]
    );
    
    if (member.rows.length === 0 || member.rows[0].role === 'viewer') {
      return res.status(403).json({ error: 'No permission to edit playlist' });
    }
    
    // Update playlist and set updatedat to NOW()
    await pool.query(
      `UPDATE playlist 
       SET "title" = $1, "description" = $2, "visibility" = $3, "updatedat" = NOW()
       WHERE "playlistid" = $4`,
      [title, description, visibility, playlistId]
    );
    
    console.log('✅ Playlist updated:', playlistId);
    
    res.json({ 
      success: true,
      message: 'Playlist updated successfully' 
    });
  } catch (error) {
    console.error('❌ Update playlist error:', error);
    res.status(500).json({ error: 'Failed to update playlist', details: error.message });
  }
});

app.get('/api/playlists/:playlistId', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    console.log('🔍 Fetching playlist:', playlistId);
    
    const playlists = await pool.query(
      'SELECT * FROM playlist WHERE "playlistid" = $1',
      [playlistId]
    );
    
    if (playlists.rows.length === 0) {
      console.log('❌ Playlist not found:', playlistId);
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    console.log('✅ Playlist found:', playlists.rows[0].title);
    
    const memberRole = await pool.query(
      'SELECT "role" FROM playlistmember WHERE "playlistid" = $1 AND "userid" = $2',
      [playlistId, req.user.userId]
    );
    
    const members = await pool.query(
      `SELECT pm.*, u."displayname", u.email 
       FROM playlistmember pm
       JOIN users u ON pm."userid" = u."userid"
       WHERE pm."playlistid" = $1`,
      [playlistId]
    );
    
    const tracks = await pool.query(`
      SELECT 
        pi."listitemid",
        pi."position",
        t."trackid",
        t."title",
        t."durationms",
        t."coverurl",
        a."name" as "artistname",
        u."displayname",
        pi."addedat"
       FROM playlistitem pi
       JOIN track t ON pi."trackid" = t."trackid"
       JOIN artisttrack at ON t."trackid" = at."trackid"
       JOIN artist a ON at."artistid" = a."artistid"
       JOIN users u ON pi."addedbyuserid" = u."userid"
       WHERE pi."playlistid" = $1
       ORDER BY pi."position"`,
      [playlistId]
    );
    
    console.log('🎵 Tracks found:', tracks.rows.length);
    
    const playlist = playlists.rows[0];
    
    res.json({
      playlistId: playlist.playlistid,
      title: playlist.title,
      description: playlist.description,
      visibility: playlist.visibility,
      role: memberRole.rows[0]?.role || 'Viewer',
      members: members.rows,
      tracks: tracks.rows.map(t => ({
        id: t.trackid,
        title: t.title,
        artist: t.artistname,
        cover: t.coverurl || `https://picsum.photos/200?random=${t.trackid}`,
        duration: formatDuration(t.durationms),
        addedBy: t.displayname
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
    
    console.log('📝 Creating playlist:', title);
    
    // 🆕 Generate sequential playlist ID
    const lastPlaylistResult = await pool.query(
      `SELECT "playlistid" FROM playlist 
       WHERE "playlistid" ~ '^playlist_[0-9]{3}$'
       ORDER BY CAST(SUBSTRING("playlistid" FROM 10) AS INTEGER) DESC
       LIMIT 1`
    );
    
    let nextNumber = 1;
    if (lastPlaylistResult.rows.length > 0) {
      const lastPlaylistId = lastPlaylistResult.rows[0].playlistid;
      const lastNumber = parseInt(lastPlaylistId.replace('playlist_', ''), 10);
      nextNumber = lastNumber + 1;
      console.log('📊 Last playlist:', lastNumber, '→ Next:', nextNumber);
    } else {
      console.log('📊 No sequential playlists found, starting from playlist_001');
    }
    
    // Format with leading zeros: playlist_001, playlist_002, etc.
    const playlistId = `playlist_${String(nextNumber).padStart(3, '0')}`;
    console.log('✅ Generated playlistId:', playlistId);
    
    // Default to 'private' if no visibility specified
    const finalVisibility = visibility || 'private';
    
    await pool.query(
      `INSERT INTO playlist ("playlistid", "title", "description", "visibility", "creatorid", "createdat", "updatedat") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        playlistId, 
        title, 
        description || '', 
        finalVisibility,
        req.user.userId
      ]
    );
    
    await pool.query(
      `INSERT INTO playlistmember ("playlistid", "userid", "role") 
       VALUES ($1, $2, 'owner')`,
      [playlistId, req.user.userId]
    );
    
    console.log('✅ Playlist created:', playlistId, 'by user:', req.user.userId);
    
    res.json({
      playlistId,
      title,
      description: description || '',
      visibility: finalVisibility,
      createdAt: new Date().toISOString(),
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
    const { trackId, trackData } = req.body; // Accept track metadata too
    
    console.log('➕ Adding track:', trackId, 'to playlist:', playlistId);
    console.log('📦 Track data received:', trackData);
    
    const member = await pool.query(
      'SELECT "role" FROM playlistmember WHERE "playlistid" = $1 AND "userid" = $2',
      [playlistId, req.user.userId]
    );
    
    if (member.rows.length === 0 || member.rows[0].role === 'viewer') {
      return res.status(403).json({ error: 'No permission to add tracks' });
    }
    
    // 🆕 Check if track exists in database, if not create it
    const trackExists = await pool.query(
      'SELECT "trackid" FROM track WHERE "trackid" = $1',
      [trackId.toString()]
    );
    
    if (trackExists.rows.length === 0) {
      console.log('🆕 Track not in database, creating it...');
      
      if (!trackData) {
        return res.status(400).json({ 
          error: 'Track data required for new tracks',
          hint: 'Please include trackData in request body'
        });
      }
      
      // Insert the track
      await pool.query(
        `INSERT INTO track ("trackid", "title", "durationms", "album", "genre", "coverurl", "releasedate")
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          trackId.toString(),
          trackData.title || 'Unknown',
          trackData.durationInSeconds ? trackData.durationInSeconds * 1000 : 180000,
          trackData.album || 'Single',
          trackData.genre || 'Various',
          trackData.cover || `https://picsum.photos/300/300?random=${trackId}`
        ]
      );
      
      // Create or find artist
      const artistName = trackData.artist || 'Unknown Artist';
      let artistId;
      
      const artistExists = await pool.query(
        'SELECT "artistid" FROM artist WHERE "name" = $1',
        [artistName]
      );
      
      if (artistExists.rows.length === 0) {
        artistId = 'artist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await pool.query(
          `INSERT INTO artist ("artistid", "name", "country", "debutyear", "followers", "artisttype")
           VALUES ($1, $2, 'Unknown', 2020, 0, 'person')`,
          [artistId, artistName]
        );
      } else {
        artistId = artistExists.rows[0].artistid;
      }
      
      // Link artist to track
      await pool.query(
        `INSERT INTO artisttrack ("artistid", "trackid", "role")
         VALUES ($1, $2, 'primary')
         ON CONFLICT DO NOTHING`,
        [artistId, trackId.toString()]
      );
      
      console.log('✅ Track created in database');
    }
    
    // Check if already in playlist
    const existing = await pool.query(
      'SELECT * FROM playlistitem WHERE "playlistid" = $1 AND "trackid" = $2',
      [playlistId, trackId.toString()]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Track already in playlist' });
    }
    
    // Get max position
    const maxPos = await pool.query(
      'SELECT MAX("position") as "maxpos" FROM playlistitem WHERE "playlistid" = $1',
      [playlistId]
    );
    
    const position = (maxPos.rows[0].maxpos || 0) + 1;
    const itemId = 'item_' + Date.now();
    
    // Add to playlist
    await pool.query(
      `INSERT INTO playlistitem ("listitemid", "playlistid", "trackid", "addedbyuserid", "position") 
       VALUES ($1, $2, $3, $4, $5)`,
      [itemId, playlistId, trackId.toString(), req.user.userId, position]
    );
    
    console.log('✅ Track added to playlist successfully');
    res.json({ message: 'Track added successfully', itemId });
  } catch (error) {
    console.error('❌ Add track error:', error);
    res.status(500).json({ error: 'Failed to add track', details: error.message });
  }
});

app.delete('/api/playlists/:playlistId/tracks/:trackId', authenticateToken, async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;

    // Check if user has permission (owner or editor)
    const member = await pool.query(
      'SELECT "role" FROM playlistmember WHERE "playlistid" = $1 AND "userid" = $2',
      [playlistId, req.user.userId]
    );

    if (member.rows.length === 0 || !['owner', 'editor'].includes(member.rows[0].role)) {
      return res.status(403).json({ error: 'No permission to remove tracks' });
    }

    // Remove track from playlist
    await pool.query(
      'DELETE FROM playlistitem WHERE "playlistid" = $1 AND "trackid" = $2',
      [playlistId, trackId]
    );

    console.log('✅ Track removed from playlist:', playlistId, 'by user:', req.user.userId);
    res.json({ message: 'Track removed successfully' });
  } catch (error) {
    console.error('❌ Remove track error:', error);
    res.status(500).json({ error: 'Failed to remove track', details: error.message });
  }
});

app.delete('/api/playlists/:playlistId', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;

    // Check if user is the owner
    const member = await pool.query(
      'SELECT "role" FROM playlistmember WHERE "playlistid" = $1 AND "userid" = $2',
      [playlistId, req.user.userId]
    );

    if (member.rows.length === 0 || member.rows[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can delete playlists' });
    }

    // Delete playlist (CASCADE will handle related records)
    await pool.query('DELETE FROM playlist WHERE "playlistid" = $1', [playlistId]);

    console.log('✅ Playlist deleted:', playlistId, 'by user:', req.user.userId);
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('❌ Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist', details: error.message });
  }
});

// ==================== PLAYLIST MEMBERS ROUTES ====================
app.get('/api/playlists/:playlistId/members', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;

    const members = await pool.query(`
      SELECT pm.*, u."displayname", u.email, u.country, u.language
      FROM playlistmember pm
      JOIN users u ON pm."userid" = u."userid"
      WHERE pm."playlistid" = $1
      ORDER BY pm."joinedat" ASC
    `, [playlistId]);

    res.json(members.rows);
  } catch (error) {
    console.error('❌ Fetch members error:', error);
    res.status(500).json({ error: 'Failed to fetch members', details: error.message });
  }
});

app.delete('/api/playlists/:playlistId/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { playlistId, userId } = req.params;

    // Check if user has permission (owner only for removing members)
    const member = await pool.query(
      'SELECT "role" FROM playlistmember WHERE "playlistid" = $1 AND "userid" = $2',
      [playlistId, req.user.userId]
    );

    if (member.rows.length === 0 || member.rows[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can remove members' });
    }

    // Don't allow removing the owner
    const targetMember = await pool.query(
      'SELECT "role" FROM playlistmember WHERE "playlistid" = $1 AND "userid" = $2',
      [playlistId, userId]
    );

    if (targetMember.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (targetMember.rows[0].role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove playlist owner' });
    }

    await pool.query(
      'DELETE FROM playlistmember WHERE "playlistid" = $1 AND "userid" = $2',
      [playlistId, userId]
    );

    console.log('✅ Member removed from playlist:', playlistId, 'by user:', req.user.userId);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('❌ Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member', details: error.message });
  }
});

app.post('/api/playlists/:playlistId/invite', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { role } = req.body;

    // Check if user has permission (owner or editor)
    const member = await pool.query(
      'SELECT "role" FROM playlistmember WHERE "playlistid" = $1 AND "userid" = $2',
      [playlistId, req.user.userId]
    );

    if (member.rows.length === 0 || !['owner', 'editor'].includes(member.rows[0].role)) {
      return res.status(403).json({ error: 'No permission to generate invites' });
    }

    // Generate a simple invite token (in production, use JWT or proper tokens)
    const inviteToken = Buffer.from(JSON.stringify({
      playlistId,
      role: role || 'viewer',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })).toString('base64');

    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join-playlist/${inviteToken}`;

    console.log('✅ Invite generated for playlist:', playlistId);
    res.json({
      inviteUrl,
      inviteToken,
      role: role || 'viewer',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    console.error('❌ Generate invite error:', error);
    res.status(500).json({ error: 'Failed to generate invite', details: error.message });
  }
});

app.post('/api/playlists/join/:inviteToken', authenticateToken, async (req, res) => {
  try {
    const { inviteToken } = req.params;

    // Decode invite token
    const inviteData = JSON.parse(Buffer.from(inviteToken, 'base64').toString());

    if (new Date() > new Date(inviteData.expiresAt)) {
      return res.status(400).json({ error: 'Invite link expired' });
    }

    const { playlistId, role } = inviteData;

    // Check if already a member
    const existing = await pool.query(
      'SELECT * FROM playlistmember WHERE "playlistid" = $1 AND "userid" = $2',
      [playlistId, req.user.userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already a member of this playlist' });
    }

    // Add user to playlist
    await pool.query(
      `INSERT INTO playlistmember ("playlistid", "userid", "role")
       VALUES ($1, $2, $3)`,
      [playlistId, req.user.userId, role]
    );

    console.log('✅ User joined playlist:', playlistId, 'with role:', role);
    res.json({ message: 'Successfully joined playlist', role });
  } catch (error) {
    console.error('❌ Join playlist error:', error);
    res.status(500).json({ error: 'Failed to join playlist', details: error.message });
  }
});

// ==================== ALERTS ROUTES ====================
app.get('/api/alerts/pending', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        a."alertid",
        a."channel",
        a."state",
        a."createdat",
        t."title" as "tracktitle",
        t."coverurl",
        ar."name" as "artistname"
      FROM alert a
      JOIN track t ON a."trackid" = t."trackid"
      JOIN artisttrack at ON t."trackid" = at."trackid"
      JOIN artist ar ON at."artistid" = ar."artistid"
      WHERE a."userid" = $1 AND a."state" = 'queued'
      ORDER BY a."createdat" DESC
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
      `UPDATE alert SET "state" = 'sent', "deliveredat" = NOW() 
       WHERE "alertid" = $1 AND "userid" = $2`,
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
        t."trackid" as id,
        t."title" as title,
        a."name" as artist,
        t."durationms" as duration,
        t."coverurl" as cover,
        t."album" as album,
        t."genre" as genre
      FROM track t
      JOIN artisttrack at ON t."trackid" = at."trackid"
      JOIN artist a ON at."artistid" = a."artistid"
      ORDER BY t."releasedate" DESC
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

// Root route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Loopify API is running!',
    status: 'healthy',
    endpoints: {
      auth: '/api/auth/register, /api/auth/login',
      songs: '/api/songs/trending',
      artists: '/api/artists/popular',
      playlists: '/api/playlists/user'
    }
  });
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