const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

// Environment-aware base URL
const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5177';

// CORS configuration - production ready
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, process.env.PRODUCTION_URL].filter(Boolean)
    : [
        'http://localhost:5175', 
        'http://localhost:5173', 
        'http://localhost:5176',
        'http://localhost:5177',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5177'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from React build (PRODUCTION)
app.use(express.static(path.join(__dirname, '../dist')));

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JAMENDO_CLIENT_ID = 'aba8b95b';

// SQLite database connection
let db;

// Helper function to format duration
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Initialize database
(async () => {
  db = await open({
    filename: path.join(__dirname, 'loopify.db'),
    driver: sqlite3.Database
  });

  console.log('Connected to SQLite database successfully');
  
  // ==================== USER TABLES ====================
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      UserID INTEGER PRIMARY KEY AUTOINCREMENT,
      DisplayName TEXT NOT NULL,
      Email TEXT UNIQUE NOT NULL,
      Password TEXT NOT NULL,
      Language TEXT DEFAULT 'en',
      Country TEXT,
      Sex TEXT,
      Status TEXT DEFAULT 'active',
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS UserStats (
      UserID INTEGER PRIMARY KEY,
      PlaylistCount INTEGER DEFAULT 0,
      FollowerCount INTEGER DEFAULT 0,
      FollowingCount INTEGER DEFAULT 0,
      MinutesListened INTEGER DEFAULT 0,
      SongsLiked INTEGER DEFAULT 0,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `);

  // ==================== ARTIST TABLES ====================
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Artist (
      ArtistID INTEGER PRIMARY KEY,
      Name TEXT NOT NULL,
      Country TEXT,
      DebutYear INTEGER,
      ImageURL TEXT
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Person (
      ArtistID INTEGER PRIMARY KEY,
      Gender TEXT,
      Rating REAL,
      DateOfBirth DATE,
      FOREIGN KEY (ArtistID) REFERENCES Artist(ArtistID) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS \`Group\` (
      ArtistID INTEGER PRIMARY KEY,
      GroupSize INTEGER,
      LeaderName TEXT,
      MemberName TEXT,
      Role TEXT,
      FOREIGN KEY (ArtistID) REFERENCES Artist(ArtistID) ON DELETE CASCADE
    )
  `);

  // ==================== TRACK TABLE ====================
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Track (
      TrackID INTEGER PRIMARY KEY,
      Title TEXT NOT NULL,
      DurationMs INTEGER,
      ExplicitFlag INTEGER DEFAULT 0,
      ReleaseDate DATE,
      Genre TEXT,
      AlbumName TEXT,
      ImageURL TEXT
    )
  `);

  // ==================== RELATIONSHIP TABLES ====================
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ArtistTrack (
      ArtistID INTEGER,
      TrackID INTEGER,
      PRIMARY KEY (ArtistID, TrackID),
      FOREIGN KEY (ArtistID) REFERENCES Artist(ArtistID) ON DELETE CASCADE,
      FOREIGN KEY (TrackID) REFERENCES Track(TrackID) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS UserArtistFollow (
      UserID INTEGER,
      ArtistID INTEGER,
      FollowedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      AlertEnabled INTEGER DEFAULT 1,
      PRIMARY KEY (UserID, ArtistID),
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (ArtistID) REFERENCES Artist(ArtistID) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Alert (
      AlertID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserID INTEGER,
      TrackID INTEGER,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      Channel TEXT CHECK(Channel IN ('Email', 'Push', 'InApp')),
      State TEXT CHECK(State IN ('Queued', 'Sent', 'Failed')),
      DeliveredAt DATETIME,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (TrackID) REFERENCES Track(TrackID) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS UserTrackStat (
      UserID INTEGER,
      TrackID INTEGER,
      PlayCount INTEGER DEFAULT 0,
      LikeCount INTEGER DEFAULT 0,
      AddCount INTEGER DEFAULT 0,
      SkipCount INTEGER DEFAULT 0,
      LastEventAt DATETIME,
      PRIMARY KEY (UserID, TrackID),
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (TrackID) REFERENCES Track(TrackID) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Listening (
      UserID INTEGER,
      TrackID INTEGER,
      Device TEXT,
      ListenedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (UserID, TrackID, ListenedAt),
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (TrackID) REFERENCES Track(TrackID) ON DELETE CASCADE
    )
  `);

  // ==================== PLAYLIST TABLES ====================
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Playlist (
      PlaylistID INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT NOT NULL,
      Description TEXT,
      Visibility TEXT CHECK(Visibility IN ('Private', 'Shared', 'Public')) DEFAULT 'Private',
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS PlaylistMember (
      PlaylistID INTEGER,
      UserID INTEGER,
      Role TEXT CHECK(Role IN ('Owner', 'Editor', 'Viewer')) DEFAULT 'Viewer',
      JoinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (PlaylistID, UserID),
      FOREIGN KEY (PlaylistID) REFERENCES Playlist(PlaylistID) ON DELETE CASCADE,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS PlaylistItem (
      PlaylistItemID INTEGER PRIMARY KEY AUTOINCREMENT,
      PlaylistID INTEGER,
      TrackID INTEGER,
      AddedByUserID INTEGER,
      AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      Position INTEGER,
      FOREIGN KEY (PlaylistID) REFERENCES Playlist(PlaylistID) ON DELETE CASCADE,
      FOREIGN KEY (TrackID) REFERENCES Track(TrackID) ON DELETE CASCADE,
      FOREIGN KEY (AddedByUserID) REFERENCES Users(UserID) ON DELETE SET NULL
    )
  `);

  // ==================== MOOD TABLES ====================
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Mood (
      MoodID INTEGER PRIMARY KEY AUTOINCREMENT,
      FeelingName TEXT UNIQUE NOT NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS MoodSession (
      SessionID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserID INTEGER,
      MoodID INTEGER,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      TargetDurationMin INTEGER,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (MoodID) REFERENCES Mood(MoodID) ON DELETE CASCADE
    )
  `);

  // Insert default moods
  await db.run(`
    INSERT OR IGNORE INTO Mood (FeelingName) VALUES 
    ('Happy'), ('Sad'), ('Energetic'), ('Relaxed'), ('Focused'), ('Party')
  `);

  console.log('All tables created successfully');
  
  // ==================== AUTO-POPULATE IF EMPTY ====================
  
  const trackCount = await db.get('SELECT COUNT(*) as count FROM Track');
  
  if (trackCount.count === 0) {
    console.log('Database is empty. Auto-populating from Jamendo API...');
    
    try {
      const tracksResponse = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=200&order=popularity_week&include=musicinfo`
      );
      const tracksData = await tracksResponse.json();
      
      let tracks = 0;
      let artists = 0;
      
      for (const track of tracksData.results) {
        const existingArtist = await db.get('SELECT ArtistID FROM Artist WHERE ArtistID = ?', [track.artist_id]);
        
        if (!existingArtist) {
          await db.run(
            `INSERT INTO Artist (ArtistID, Name, Country, ImageURL) VALUES (?, ?, ?, ?)`,
            [track.artist_id, track.artist_name, null, track.image]
          );
          await db.run(`INSERT INTO Person (ArtistID) VALUES (?)`, [track.artist_id]);
          artists++;
        }
        
        await db.run(
          `INSERT INTO Track (TrackID, Title, DurationMs, ReleaseDate, Genre, AlbumName, ImageURL) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [track.id, track.name, track.duration * 1000, track.releasedate, 
           track.musicinfo?.tags?.genres?.[0] || 'Unknown', track.album_name, track.image]
        );
        
        await db.run(
          `INSERT OR IGNORE INTO ArtistTrack (ArtistID, TrackID) VALUES (?, ?)`,
          [track.artist_id, track.id]
        );
        tracks++;
      }
      
      console.log(`Auto-populated: ${tracks} tracks, ${artists} artists`);
    } catch (error) {
      console.error('Auto-populate failed:', error.message);
    }
  } else {
    console.log(`Database already has ${trackCount.count} tracks`);
  }
})();

// ==================== AUTH ENDPOINTS ====================

app.post('/api/auth/register', async (req, res) => {
  console.log('Register attempt:', req.body.email);
  try {
    const { displayName, email, password, country, language, sex } = req.body;
    
    if (!displayName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      `INSERT INTO Users (DisplayName, Email, Password, Language, Country, Sex) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [displayName, email, hashedPassword, language || 'en', country || 'Thailand', sex || null]
    );
    
    const userId = result.lastID;
    
    await db.run('INSERT INTO UserStats (UserID) VALUES (?)', [userId]);
    
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('User registered:', email, 'ID:', userId);
    
    res.json({
      success: true,
      token,
      user: { userId, displayName, email, country, language, sex }
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
    
    console.log('User logged in:', email);
    
    res.json({
      success: true,
      token,
      user: {
        userId: user.UserID,
        displayName: user.DisplayName,
        email: user.Email,
        country: user.Country,
        language: user.Language,
        sex: user.Sex
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await db.get(
      'SELECT UserID, DisplayName, Email, Country, Language, Sex FROM Users WHERE UserID = ?',
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
      language: user.Language,
      sex: user.Sex
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

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

// ==================== MANUAL POPULATE ENDPOINT (OPTIONAL) ====================

app.post('/api/init/populate', async (req, res) => {
  try {
    console.log('Starting manual database population...');
    
    const tracksResponse = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=200&order=popularity_week&include=musicinfo`
    );
    const tracksData = await tracksResponse.json();
    
    let trackCount = 0;
    let artistCount = 0;
    
    for (const track of tracksData.results) {
      const existingArtist = await db.get('SELECT ArtistID FROM Artist WHERE ArtistID = ?', [track.artist_id]);
      
      if (!existingArtist) {
        await db.run(
          `INSERT INTO Artist (ArtistID, Name, Country, ImageURL) VALUES (?, ?, ?, ?)`,
          [track.artist_id, track.artist_name, null, track.artist_image || track.image]
        );
        await db.run(`INSERT INTO Person (ArtistID) VALUES (?)`, [track.artist_id]);
        artistCount++;
      }
      
      const existingTrack = await db.get('SELECT TrackID FROM Track WHERE TrackID = ?', [track.id]);
      
      if (!existingTrack) {
        await db.run(
          `INSERT INTO Track (TrackID, Title, DurationMs, ReleaseDate, Genre, AlbumName, ImageURL) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [track.id, track.name, track.duration * 1000, track.releasedate, 
           track.musicinfo?.tags?.genres?.[0] || 'Unknown', track.album_name, track.image]
        );
        trackCount++;
      }
      
      await db.run(
        `INSERT OR IGNORE INTO ArtistTrack (ArtistID, TrackID) VALUES (?, ?)`,
        [track.artist_id, track.id]
      );
    }
    
    console.log(`Database populated: ${trackCount} tracks, ${artistCount} artists`);
    res.json({ 
      success: true, 
      message: 'Database populated successfully',
      tracks: trackCount, 
      artists: artistCount 
    });
  } catch (error) {
    console.error('Population error:', error);
    res.status(500).json({ error: 'Failed to populate database', details: error.message });
  }
});

// ==================== FETCH FROM DATABASE ====================

app.get('/api/jamendo/tracks', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    
    const tracks = await db.all(`
      SELECT 
        t.TrackID as id,
        t.Title as title,
        a.Name as artist,
        t.DurationMs,
        t.Genre as genre,
        t.AlbumName as album,
        t.ImageURL as cover
      FROM Track t
      LEFT JOIN ArtistTrack at ON t.TrackID = at.TrackID
      LEFT JOIN Artist a ON at.ArtistID = a.ArtistID
      LIMIT ?
    `, [limit]);
    
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.cover || 'https://via.placeholder.com/300',
      duration: formatDuration(track.DurationMs / 1000),
      album: track.album,
      audioUrl: `${BASE_URL}/api/stream/${track.id}`,
      genre: track.genre
    }));
    
    console.log(`Fetched ${formattedTracks.length} tracks from DATABASE`);
    res.json(formattedTracks);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch tracks from database' });
  }
});

app.get('/api/jamendo/artists', async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    
    const artists = await db.all(`
      SELECT 
        ArtistID as id,
        Name as name,
        Country as country,
        ImageURL as avatar
      FROM Artist
      LIMIT ?
    `, [limit]);
    
    const formattedArtists = artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      type: 'Artist',
      avatar: artist.avatar || 'https://via.placeholder.com/300',
      followers: `${Math.floor(Math.random() * 100)}K followers`
    }));
    
    console.log(`Fetched ${formattedArtists.length} artists from DATABASE`);
    res.json(formattedArtists);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch artists from database' });
  }
});

app.get('/api/jamendo/artists/:artistId/tracks', async (req, res) => {
  try {
    const artistId = req.params.artistId;
    
    const tracks = await db.all(`
      SELECT 
        t.TrackID as id,
        t.Title as title,
        a.Name as artist,
        t.DurationMs,
        t.Genre as genre,
        t.AlbumName as album,
        t.ImageURL as cover
      FROM Track t
      JOIN ArtistTrack at ON t.TrackID = at.TrackID
      JOIN Artist a ON at.ArtistID = a.ArtistID
      WHERE a.ArtistID = ?
    `, [artistId]);
    
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.cover || 'https://via.placeholder.com/300',
      duration: formatDuration(track.DurationMs / 1000),
      album: track.album,
      audioUrl: `${BASE_URL}/api/stream/${track.id}`,
      genre: track.genre
    }));
    
    console.log(`Fetched ${formattedTracks.length} tracks for artist ${artistId} from DATABASE`);
    res.json(formattedTracks);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch artist tracks' });
  }
});

app.get('/api/jamendo/tracks/:id', async (req, res) => {
  try {
    const track = await db.get(`
      SELECT 
        t.TrackID as id,
        t.Title as title,
        a.Name as artist,
        t.DurationMs,
        t.Genre as genre,
        t.AlbumName as album,
        t.ImageURL as cover,
        t.ReleaseDate as releaseDate
      FROM Track t
      LEFT JOIN ArtistTrack at ON t.TrackID = at.TrackID
      LEFT JOIN Artist a ON at.ArtistID = a.ArtistID
      WHERE t.TrackID = ?
    `, [req.params.id]);
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    res.json({
      id: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.cover || 'https://via.placeholder.com/300',
      durationSeconds: track.DurationMs / 1000,
      duration: formatDuration(track.DurationMs / 1000),
      album: track.album,
      audioUrl: `${BASE_URL}/api/stream/${track.id}`,
      genre: track.genre,
      releaseDate: track.releaseDate
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

app.get('/api/sync/stats', async (req, res) => {
  try {
    const artistCount = await db.get('SELECT COUNT(*) as count FROM Artist');
    const trackCount = await db.get('SELECT COUNT(*) as count FROM Track');
    const userCount = await db.get('SELECT COUNT(*) as count FROM Users');
    
    res.json({
      artists: artistCount.count,
      tracks: trackCount.count,
      users: userCount.count
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ==================== STREAMING ENDPOINT ====================

app.get('/api/stream/:trackId', async (req, res) => {
  try {
    const trackId = req.params.trackId;
    console.log('Streaming track:', trackId);
    
    const trackResponse = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&id=${trackId}&audioformat=mp32`
    );
    
    const trackData = await trackResponse.json();
    
    if (!trackData.results || trackData.results.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    const audioUrl = trackData.results[0].audio;
    console.log('Proxying audio from:', audioUrl);
    
    const audioResponse = await fetch(audioUrl);
    
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch audio');
    }
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const Readable = require('stream').Readable;
    const stream = Readable.from(audioResponse.body);
    stream.pipe(res);
    
    console.log('Audio streaming started');
    
  } catch (error) {
    console.error('Stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream audio' });
    }
  }
});

// ==================== PLAYLIST ENDPOINTS ====================

app.post('/api/playlists/create', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { title, description, visibility } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Playlist title required' });
    }
    
    const result = await db.run(
      `INSERT INTO Playlist (Title, Description, Visibility) VALUES (?, ?, ?)`,
      [title, description || '', visibility || 'Private']
    );
    
    const playlistId = result.lastID;
    
    await db.run(
      `INSERT INTO PlaylistMember (PlaylistID, UserID, Role) VALUES (?, ?, 'Owner')`,
      [playlistId, decoded.userId]
    );
    
    await db.run(
      `UPDATE UserStats SET PlaylistCount = PlaylistCount + 1 WHERE UserID = ?`,
      [decoded.userId]
    );
    
    console.log('Playlist created:', title, 'by user', decoded.userId);
    
    res.json({
      success: true,
      playlist: { id: playlistId, title, description, visibility }
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

app.get('/api/playlists', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const playlists = await db.all(`
      SELECT 
        p.PlaylistID as id,
        p.Title as title,
        p.Description as description,
        p.Visibility as visibility,
        p.CreatedAt as createdAt,
        pm.Role as role,
        COUNT(DISTINCT pi.TrackID) as trackCount
      FROM Playlist p
      JOIN PlaylistMember pm ON p.PlaylistID = pm.PlaylistID
      LEFT JOIN PlaylistItem pi ON p.PlaylistID = pi.PlaylistID
      WHERE pm.UserID = ?
      GROUP BY p.PlaylistID
      ORDER BY p.CreatedAt DESC
    `, [decoded.userId]);
    
    res.json(playlists);
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

app.get('/api/playlists/:playlistId', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const playlistId = req.params.playlistId;
    
    const playlist = await db.get(`
      SELECT 
        p.PlaylistID as id,
        p.Title as title,
        p.Description as description,
        p.Visibility as visibility,
        p.CreatedAt as createdAt,
        pm.Role as role
      FROM Playlist p
      JOIN PlaylistMember pm ON p.PlaylistID = pm.PlaylistID
      WHERE p.PlaylistID = ? AND pm.UserID = ?
    `, [playlistId, decoded.userId]);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    const tracks = await db.all(`
      SELECT 
        t.TrackID as id,
        t.Title as title,
        t.ImageURL as cover,
        t.DurationMs,
        t.AlbumName as album,
        a.Name as artist,
        pi.AddedAt as addedAt
      FROM PlaylistItem pi
      JOIN Track t ON pi.TrackID = t.TrackID
      LEFT JOIN ArtistTrack at ON t.TrackID = at.TrackID
      LEFT JOIN Artist a ON at.ArtistID = a.ArtistID
      WHERE pi.PlaylistID = ?
      ORDER BY pi.Position, pi.AddedAt
    `, [playlistId]);
    
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.cover || 'https://via.placeholder.com/300',
      duration: formatDuration(track.DurationMs / 1000),
      album: track.album,
      audioUrl: `${BASE_URL}/api/stream/${track.id}`
    }));
    
    res.json({ ...playlist, tracks: formattedTracks });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

app.post('/api/playlists/:playlistId/tracks', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { playlistId } = req.params;
    const { trackId } = req.body;
    
    const member = await db.get(
      `SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, decoded.userId]
    );
    
    if (!member || member.Role === 'Viewer') {
      return res.status(403).json({ error: 'No permission to add tracks' });
    }
    
    const existing = await db.get(
      `SELECT * FROM PlaylistItem WHERE PlaylistID = ? AND TrackID = ?`,
      [playlistId, trackId]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Track already in playlist' });
    }
    
    const maxPos = await db.get(
      `SELECT MAX(Position) as maxPos FROM PlaylistItem WHERE PlaylistID = ?`,
      [playlistId]
    );
    
    const newPosition = (maxPos?.maxPos || 0) + 1;
    
    await db.run(
      `INSERT INTO PlaylistItem (PlaylistID, TrackID, AddedByUserID, Position) 
       VALUES (?, ?, ?, ?)`,
      [playlistId, trackId, decoded.userId, newPosition]
    );
    
    await db.run(
      `UPDATE Playlist SET UpdatedAt = CURRENT_TIMESTAMP WHERE PlaylistID = ?`,
      [playlistId]
    );
    
    console.log(`Track ${trackId} added to playlist ${playlistId}`);
    
    res.json({ success: true, message: 'Track added to playlist' });
  } catch (error) {
    console.error('Add track error:', error);
    res.status(500).json({ error: 'Failed to add track' });
  }
});

app.delete('/api/playlists/:playlistId/tracks/:trackId', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { playlistId, trackId } = req.params;
    
    const member = await db.get(
      `SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, decoded.userId]
    );
    
    if (!member || member.Role === 'Viewer') {
      return res.status(403).json({ error: 'No permission to remove tracks' });
    }
    
    await db.run(
      `DELETE FROM PlaylistItem WHERE PlaylistID = ? AND TrackID = ?`,
      [playlistId, trackId]
    );
    
    console.log(`Track ${trackId} removed from playlist ${playlistId}`);
    
    res.json({ success: true, message: 'Track removed from playlist' });
  } catch (error) {
    console.error('Remove track error:', error);
    res.status(500).json({ error: 'Failed to remove track' });
  }
});

app.delete('/api/playlists/:playlistId', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { playlistId } = req.params;
    
    const member = await db.get(
      `SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, decoded.userId]
    );
    
    if (!member || member.Role !== 'Owner') {
      return res.status(403).json({ error: 'Only owner can delete playlist' });
    }
    
    await db.run(`DELETE FROM Playlist WHERE PlaylistID = ?`, [playlistId]);
    
    await db.run(
      `UPDATE UserStats SET PlaylistCount = PlaylistCount - 1 WHERE UserID = ?`,
      [decoded.userId]
    );
    
    console.log(`Playlist ${playlistId} deleted by user ${decoded.userId}`);
    
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

app.put('/api/playlists/:playlistId', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { playlistId } = req.params;
    const { title, description, visibility } = req.body;
    
    const member = await db.get(
      `SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, decoded.userId]
    );
    
    if (!member || (member.Role !== 'Owner' && member.Role !== 'Editor')) {
      return res.status(403).json({ error: 'No permission to edit playlist' });
    }
    
    await db.run(
      `UPDATE Playlist SET Title = ?, Description = ?, Visibility = ?, UpdatedAt = CURRENT_TIMESTAMP 
       WHERE PlaylistID = ?`,
      [title, description, visibility, playlistId]
    );
    
    console.log(`Playlist ${playlistId} updated`);
    
    res.json({ success: true, message: 'Playlist updated' });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

app.post('/api/playlists/:playlistId/invite', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { playlistId } = req.params;
    const { role } = req.body;
    
    const member = await db.get(
      `SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, decoded.userId]
    );
    
    if (!member || (member.Role !== 'Owner' && member.Role !== 'Editor')) {
      return res.status(403).json({ error: 'No permission to invite' });
    }
    
    const randomStr = Math.random().toString(36).substring(2, 10);
    const inviteData = `${playlistId}-${randomStr}-${role || 'Viewer'}`;
    const inviteCode = Buffer.from(inviteData).toString('base64');
    
    console.log(`Invite code generated for playlist ${playlistId} with role ${role}`);
    
    res.json({ 
      success: true, 
      inviteCode,
      inviteUrl: `${FRONTEND_URL}/invite/${inviteCode}`,
      role: role || 'Viewer'
    });
  } catch (error) {
    console.error('Generate invite error:', error);
    res.status(500).json({ error: 'Failed to generate invite' });
  }
});

app.post('/api/playlists/join/:inviteCode', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { inviteCode } = req.params;
    
    const decodedCode = Buffer.from(inviteCode, 'base64').toString('utf-8');
    const parts = decodedCode.split('-');
    const playlistId = parseInt(parts[0]);
    const roleFromCode = parts[2] || 'Viewer';
    
    if (!playlistId || isNaN(playlistId)) {
      return res.status(400).json({ error: 'Invalid invite code' });
    }
    
    const playlist = await db.get('SELECT * FROM Playlist WHERE PlaylistID = ?', [playlistId]);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    const existingMember = await db.get(
      `SELECT * FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, decoded.userId]
    );
    
    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this playlist' });
    }
    
    await db.run(
      `INSERT INTO PlaylistMember (PlaylistID, UserID, Role) VALUES (?, ?, ?)`,
      [playlistId, decoded.userId, roleFromCode]
    );
    
    console.log(`User ${decoded.userId} joined playlist ${playlistId} as ${roleFromCode}`);
    
    res.json({ 
      success: true, 
      message: 'Successfully joined playlist',
      playlistId,
      role: roleFromCode
    });
  } catch (error) {
    console.error('Join playlist error:', error);
    res.status(500).json({ error: 'Failed to join playlist' });
  }
});

app.get('/api/playlists/:playlistId/members', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { playlistId } = req.params;
    
    const member = await db.get(
      `SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, decoded.userId]
    );
    
    if (!member) {
      return res.status(403).json({ error: 'No access to this playlist' });
    }
    
    const members = await db.all(`
      SELECT 
        u.UserID as userId,
        u.DisplayName as displayName,
        u.Email as email,
        pm.Role as role,
        pm.JoinedAt as joinedAt
      FROM PlaylistMember pm
      JOIN Users u ON pm.UserID = u.UserID
      WHERE pm.PlaylistID = ?
      ORDER BY 
        CASE pm.Role 
          WHEN 'Owner' THEN 1 
          WHEN 'Editor' THEN 2 
          WHEN 'Viewer' THEN 3 
        END,
        pm.JoinedAt
    `, [playlistId]);
    
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
});

app.put('/api/playlists/:playlistId/members/:userId/role', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { playlistId, userId } = req.params;
    const { role } = req.body;
    
    const member = await db.get(
      `SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, decoded.userId]
    );
    
    if (!member || member.Role !== 'Owner') {
      return res.status(403).json({ error: 'Only owner can change roles' });
    }
    
    const targetMember = await db.get(
      `SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, userId]
    );
    
    if (targetMember && targetMember.Role === 'Owner') {
      return res.status(400).json({ error: 'Cannot change owner role' });
    }
    
    await db.run(
      `UPDATE PlaylistMember SET Role = ? WHERE PlaylistID = ? AND UserID = ?`,
      [role, playlistId, userId]
    );
    
    res.json({ success: true, message: 'Role updated' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

app.delete('/api/playlists/:playlistId/members/:userId', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { playlistId, userId } = req.params;
    
    const member = await db.get(
      `SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, decoded.userId]
    );
    
    if (!member || member.Role !== 'Owner') {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }
    
    const targetMember = await db.get(
      `SELECT Role FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, userId]
    );
    
    if (targetMember && targetMember.Role === 'Owner') {
      return res.status(400).json({ error: 'Cannot remove owner' });
    }
    
    await db.run(
      `DELETE FROM PlaylistMember WHERE PlaylistID = ? AND UserID = ?`,
      [playlistId, userId]
    );
    
    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// ==================== TEST ENDPOINT ====================

app.get('/api/test/db', async (req, res) => {
  try {
    const users = await db.get('SELECT COUNT(*) as count FROM Users');
    const tracks = await db.get('SELECT COUNT(*) as count FROM Track');
    const artists = await db.get('SELECT COUNT(*) as count FROM Artist');
    
    res.json({ 
      message: 'Database connection successful', 
      userCount: users.count,
      trackCount: tracks.count,
      artistCount: artists.count,
      database: 'SQLite (loopify.db)'
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ==================== CATCH-ALL ROUTE FOR REACT ROUTER ====================
// This MUST be the last route - it serves the React app for any non-API routes
// Catch-all route - must be LAST
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`
🎵 Loopify Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: ${BASE_URL}
📂 Database: SQLite (loopify.db)
🌍 Environment: ${process.env.NODE_ENV || 'development'}

Music API Endpoints:
   GET  ${BASE_URL}/api/jamendo/tracks
   GET  ${BASE_URL}/api/jamendo/artists
   GET  ${BASE_URL}/api/jamendo/artists/:id/tracks

Frontend: Serving React app from /dist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});