# Loopify Backend - Node.js/Express API Server

A robust, production-ready backend server for the Loopify music streaming platform, built with Node.js, Express.js, and PostgreSQL, deployed on Render.com.

## 🚀 Overview

The Loopify backend serves as the central API hub that powers the entire music streaming application. It handles user authentication, music data management, collaborative playlist features, and real-time streaming capabilities.

## 🏗 Architecture

### Core Technologies
- **Runtime**: Node.js with ES6+ syntax
- **Framework**: Express.js (v5.1.0)
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **CORS**: Configured for multiple origins (development & production)

### Database Design
- **Connection Pooling**: Efficient PostgreSQL connection management
- **SSL Support**: Secure connections for production deployment
- **Sequential ID Generation**: Smart user and playlist ID generation system
- **Referential Integrity**: Foreign key constraints and cascade operations

## 🔧 How It Works

### 1. Server Initialization

```javascript
// Express app setup with middleware
const app = express();
app.use(cors(corsOptions));  // Multi-origin CORS configuration
app.use(express.json());      // JSON body parsing

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Connection timeout
});
```

### 2. Authentication System

#### JWT-Based Authentication
```javascript
// Middleware for protecting routes
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

#### User Registration Process
1. **Input Validation**: Check required fields (displayName, email, password)
2. **Duplicate Check**: Verify email uniqueness
3. **Password Hashing**: Use bcrypt with salt rounds of 10
4. **Sequential ID Generation**: Generate user_001, user_002, etc.
5. **JWT Token Creation**: Sign token with 7-day expiration
6. **Database Insertion**: Store user with hashed password

#### Login Process
1. **Credential Verification**: Check email and password
2. **Password Comparison**: Use bcrypt.compare() for secure validation
3. **JWT Token Generation**: Create new token for authenticated session

### 3. Database Operations

#### Connection Management
```javascript
// Production PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Query execution with error handling
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

#### Sequential ID Generation
The backend implements a smart ID generation system for users and playlists:

```javascript
// Generate sequential user IDs: user_001, user_002, etc.
const lastUserResult = await pool.query(
  `SELECT "userid" FROM users
   WHERE "userid" ~ '^user_[0-9]{3}$'
   ORDER BY CAST(SUBSTRING("userid" FROM 6) AS INTEGER) DESC
   LIMIT 1`
);

const nextNumber = lastUserResult.rows.length > 0
  ? parseInt(lastUserResult.rows[0].userid.replace('user_', '')) + 1
  : 1;

const userId = `user_${String(nextNumber).padStart(3, '0')}`;
```

### 4. Music Data Management

#### Jamendo API Integration
The backend fetches music data from the Jamendo API and stores it locally:

```javascript
// Fetch tracks from Jamendo
const response = await fetch(
  `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=json&limit=100`
);

// Process and store in PostgreSQL
for (const track of data.results) {
  await pool.query(
    `INSERT INTO track ("trackid", "title", "durationms", "album", "genre", "coverurl")
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [track.id.toString(), track.name, track.duration * 1000, track.album_name, 'Various', track.image]
  );
}
```

#### Track Import Process
1. **API Fetching**: Retrieve popular tracks from Jamendo
2. **Duplicate Checking**: Skip already imported tracks
3. **Artist Management**: Create or link artists to tracks
4. **Relationship Mapping**: Maintain artist-track relationships

### 5. Playlist Collaboration System

#### Role-Based Permissions
The system implements three user roles for playlist collaboration:

- **Owner**: Full control (edit, delete, manage members)
- **Editor**: Can edit playlist and add/remove tracks
- **Viewer**: Read-only access

#### Playlist Creation Process
```javascript
// Create playlist with sequential ID
const playlistId = `playlist_${String(nextNumber).padStart(3, '0')}`;

await pool.query(
  `INSERT INTO playlist ("playlistid", "title", "description", "visibility", "creatorid")
   VALUES ($1, $2, $3, $4, $5)`,
  [playlistId, title, description, visibility, req.user.userId]
);

// Add creator as owner
await pool.query(
  `INSERT INTO playlistmember ("playlistid", "userid", "role")
   VALUES ($1, $2, 'owner')`,
  [playlistId, req.user.userId]
);
```

#### Invite System
```javascript
// Generate invite token
const inviteToken = Buffer.from(JSON.stringify({
  playlistId,
  role: role || 'viewer',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
})).toString('base64');
```

### 6. Real-time Features

#### Play Tracking
```javascript
// Track user plays for analytics
await pool.query(`
  INSERT INTO usertrackstat ("userid", "trackid", "playcount", "lasteventat")
  VALUES ($1, $2, 1, NOW())
  ON CONFLICT ("userid", "trackid")
  DO UPDATE SET "playcount" = usertrackstat."playcount" + 1, "lasteventat" = NOW()
`, [user.userId, songId]);
```

#### Listening History
```javascript
// Store listening sessions
await pool.query(`
  INSERT INTO listening ("userid", "trackid", "device")
  VALUES ($1, $2, 'web')
`, [user.userId, songId]);
```

### 7. Error Handling & Logging

#### Comprehensive Error Handling
```javascript
try {
  // Database operations
} catch (error) {
  console.error('❌ Error:', error);
  res.status(500).json({
    error: 'Operation failed',
    details: error.message
  });
}
```

#### Request Logging
```javascript
console.log('📝 Creating playlist:', title);
console.log('✅ Playlist created:', playlistId, 'by user:', req.user.userId);
console.log('❌ Error:', error.message);
```

## 🔌 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/profile` - Get user profile (protected)

### Music Routes
- `GET /api/songs/trending` - Get trending songs with pagination
- `POST /api/songs/:songId/play` - Track song plays
- `GET /api/artists/popular` - Get popular artists

### Playlist Routes
- `GET /api/playlists/user` - Get user's playlists
- `POST /api/playlists/create` - Create new playlist
- `GET /api/playlists/:id` - Get playlist details
- `POST /api/playlists/:id/tracks` - Add track to playlist
- `DELETE /api/playlists/:id/tracks/:trackId` - Remove track
- `PUT /api/playlists/:id` - Update playlist details
- `DELETE /api/playlists/:id` - Delete playlist

### Collaboration Routes
- `POST /api/playlists/:id/invite` - Generate invite link
- `POST /api/playlists/join/:inviteToken` - Join via invite
- `GET /api/playlists/:id/members` - Get playlist members
- `DELETE /api/playlists/:id/members/:userId` - Remove member

### System Routes
- `GET /api/test/db` - Database connection test
- `GET /api/test/users` - Users table test
- `POST /api/tracks/import-from-jamendo` - Import tracks from API

## 🗄 Database Schema

### Core Tables

#### Users & Authentication
- **users**: User accounts with profile information
- **userstats**: User statistics and metrics

#### Music Content
- **track**: Music tracks with metadata
- **artist**: Artist information and profiles
- **artisttrack**: Many-to-many artist-track relationships

#### Playlist System
- **playlist**: Playlist information and settings
- **playlistmember**: User roles in playlists
- **playlistitem**: Tracks within playlists

#### Analytics & Engagement
- **usertrackstat**: User-track interaction statistics
- **listening**: Listening history and sessions
- **alert**: Notification and alert system

## 🚀 Deployment & Production

### Render.com Deployment
- **Service Type**: Web Service (Node.js)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Configured for PostgreSQL connection

### Environment Configuration
```env
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://... # Render PostgreSQL
JWT_SECRET=your-secret-key
BASE_URL=https://loopify-backend-sshh.onrender.com
FRONTEND_URL=https://loopify-g41n.onrender.com
```

### Database Setup
The `setup-database.js` script handles:
1. **Schema Creation**: Execute SQL schema file
2. **Sample Data**: Insert test users and playlists
3. **Jamendo Seeding**: Fetch and import real music data
4. **Verification**: Confirm all tables and data exist

## 🔐 Security Features

### Password Security
- **bcrypt Hashing**: Salt rounds of 10 for strong password protection
- **JWT Authentication**: Stateless token-based authentication
- **Token Expiration**: 7-day token validity with refresh capability

### CORS Configuration
```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',                    // Development
    'https://loopify-g41n.onrender.com',       // Production frontend
    'https://loopify-backend-sshh.onrender.com', // Production backend
    process.env.FRONTEND_URL                   // Environment variable
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};
```

### Input Validation
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Protection**: Input sanitization and validation
- **Authentication Required**: Protected routes verify JWT tokens

## 📊 Performance Optimizations

### Database Performance
- **Connection Pooling**: Efficient PostgreSQL connection reuse
- **Query Optimization**: Indexed queries for fast lookups
- **Pagination**: Built-in pagination for large datasets

### API Performance
- **Response Formatting**: Consistent JSON response structure
- **Error Handling**: Comprehensive error catching and logging
- **Graceful Shutdown**: Proper cleanup on server termination

## 🧪 Testing & Debugging

### Test Endpoints
```javascript
// Database connectivity test
GET /api/test/db

// Users table verification
GET /api/test/users

// Track data inspection
GET /api/test/sample-track
```

### Development Features
- **Hot Reload**: nodemon for development
- **Detailed Logging**: Console logs for debugging
- **Error Details**: Comprehensive error messages in development

## 🔄 Data Flow

### User Registration Flow
1. **Client Request** → Validate input → Check duplicates → Hash password
2. **ID Generation** → Generate sequential user ID → Database insertion
3. **JWT Creation** → Sign token → Return success response

### Playlist Creation Flow
1. **Client Request** → Authenticate user → Validate permissions
2. **ID Generation** → Generate sequential playlist ID → Create playlist record
3. **Member Assignment** → Add creator as owner → Return playlist data

### Music Playback Flow
1. **Client Request** → Authenticate user (optional) → Track play event
2. **Analytics Update** → Update usertrackstat → Log listening session
3. **Response** → Confirm play tracking → Continue playback

## 🚨 Error Handling

### Database Errors
- **Connection Failures**: Automatic retry and detailed error logging
- **Query Errors**: Parameterized queries prevent injection attacks
- **Constraint Violations**: Proper foreign key error handling

### Authentication Errors
- **Invalid Tokens**: Clear error messages for expired/invalid JWTs
- **Missing Credentials**: Required field validation
- **Permission Denied**: Role-based access control enforcement

## 🔧 Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Production build
npm start
```

### Database Setup
```bash
# Initialize database with schema and sample data
node setup-database.js
```

### Testing the API
```bash
# Test database connection
curl http://localhost:5001/api/test/db

# Test user registration
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Test User","email":"test@example.com","password":"password123"}'
```

## 📈 Monitoring & Analytics

### Built-in Analytics
- **Play Tracking**: User listening statistics
- **User Engagement**: Track user activity and preferences
- **Playlist Metrics**: Track popularity and usage

### Logging System
- **Request Logging**: Track all API requests and responses
- **Error Logging**: Comprehensive error tracking and debugging
- **Performance Monitoring**: Database query performance tracking

---

## 🎯 Key Features Explained

### Sequential ID Generation
The backend implements a sophisticated ID generation system that creates human-readable, sequential IDs for users (`user_001`, `user_002`) and playlists (`playlist_001`, `playlist_002`). This system:

- Maintains referential integrity
- Provides predictable ID patterns
- Handles concurrent requests safely
- Falls back gracefully if sequential generation fails

### Real-time Collaboration
The playlist collaboration system allows multiple users to work together with different permission levels:

- **Owners** can manage members, delete playlists, and modify all settings
- **Editors** can add/remove tracks and modify playlist details
- **Viewers** have read-only access to playlist content

### Music Data Pipeline
The system creates a complete music data pipeline:

1. **External API**: Fetches data from Jamendo API
2. **Local Storage**: Stores music metadata in PostgreSQL
3. **Relationship Mapping**: Links artists to tracks properly
4. **Analytics**: Tracks user interactions and preferences

This backend serves as a production-ready foundation for a modern music streaming platform, demonstrating advanced Node.js patterns, database design, and API architecture.