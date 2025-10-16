# Loopify - Music Streaming Platform

A full-stack music streaming application with collaborative playlist features, built with React, Node.js, and PostgreSQL, deployed on Render.com.

## 🚀 Live Application

**Frontend:** [https://loopify-g41n.onrender.com](https://loopify-g41n.onrender.com)
**Backend API:** [https://loopify-backend-sshh.onrender.com](https://loopify-backend-sshh.onrender.com)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Development Setup](#development-setup)
- [Database Access](#database-access)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- **Music Streaming**: Stream music from Jamendo API with full playback controls
- **User Authentication**: Secure JWT-based user registration and login system
- **Collaborative Playlists**: Create, share, and collaborate on playlists with role-based permissions
- **Artist Discovery**: Browse and explore artists with detailed profiles
- **User Profiles**: Personalized user accounts with statistics and preferences
- **Mood-based Sessions**: Create playlists based on different moods (Happy, Sad, Energetic, etc.)

### Advanced Features
- **Playlist Management**: Full CRUD operations with role-based access (Owner, Editor, Viewer)
- **Invite System**: Generate invite codes to share playlists with specific roles
- **Member Management**: Add, remove, and change member roles in playlists
- **Real-time Updates**: Live playlist updates and member synchronization
- **Responsive Design**: Mobile-friendly interface built with Bootstrap

## 🛠 Tech Stack

### Frontend
- **React 19.1.1** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Bootstrap** - Responsive UI components and styling
- **Three.js & React Three Fiber** - 3D visualizations and animations

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **JWT (jsonwebtoken)** - Authentication token management
- **bcrypt** - Password hashing and security
- **CORS** - Cross-origin resource sharing configuration

### Database
- **PostgreSQL** - Relational database (deployed on Render)
- **Migration from SQLite** - Originally developed with SQLite, migrated to PostgreSQL for production

### External APIs
- **Jamendo API** - Music metadata and streaming source
- **Render.com** - Cloud deployment platform

## 🏗 Architecture

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend│◄──►│  Express Backend │◄──►│   Jamendo API   │
│  (Render.com)   │    │   (Render.com)   │    │   (External)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌──────────────────┐
│   PostgreSQL    │    │    Audio         │
│   Database      │    │   Streaming      │
│  (Render.com)   │    │   (Proxy)        │
└─────────────────┘    └──────────────────┘
```

### Key Components

#### Frontend Structure (`/Loopify/src/`)
```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   ├── SideBar.tsx     # Sidebar navigation
│   ├── AddToPlaylistModal.tsx
│   └── content.tsx     # Main content display
├── pages/              # Route components
│   ├── Login.tsx       # Authentication
│   ├── Regist.tsx      # User registration
│   ├── Profile.tsx     # User profile
│   ├── Artist.tsx      # Artist pages
│   ├── PlaylistDetail.tsx
│   ├── JoinPlaylist.tsx
│   └── playTheSong.tsx # Music player
├── data/
│   └── data.sql        # Database schema
└── assets/             # Images and static files
```

#### Backend Structure (`/Loopify/loopify-backend/`)
```
loopify-backend/
├── Server.js           # Main server file
├── setup-database.js   # Database initialization
└── package.json        # Backend dependencies
```

## 🗄 Database Schema

### Core Tables

#### User Management
- **Users** - User accounts and profiles
- **UserStats** - User statistics and metrics

#### Music Content
- **Artist** - Artist information and metadata
- **Person** - Individual artist details
- **Group** - Group/band information
- **Track** - Music track details and metadata

#### Social Features
- **UserArtistFollow** - Artist following relationships
- **Playlist** - Playlist information
- **PlaylistMember** - Playlist collaboration
- **PlaylistItem** - Tracks within playlists

#### Engagement
- **UserTrackStat** - User-track interaction statistics
- **Listening** - Listening history and analytics
- **Alert** - Notification and alert system
- **Mood** - Mood categories for playlists
- **MoodSession** - Mood-based playlist sessions

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Music Discovery
- `GET /api/jamendo/tracks` - Get tracks from database
- `GET /api/jamendo/artists` - Get artists from database
- `GET /api/jamendo/artists/:id/tracks` - Get artist's tracks
- `GET /api/jamendo/tracks/:id` - Get specific track details

### Playlist Management
- `POST /api/playlists/create` - Create new playlist
- `GET /api/playlists` - Get user's playlists
- `GET /api/playlists/:id` - Get playlist with tracks
- `POST /api/playlists/:id/tracks` - Add track to playlist
- `DELETE /api/playlists/:id/tracks/:trackId` - Remove track from playlist
- `DELETE /api/playlists/:id` - Delete playlist

### Collaboration Features
- `POST /api/playlists/:id/invite` - Generate playlist invite code
- `POST /api/playlists/join/:inviteCode` - Join playlist via invite
- `GET /api/playlists/:id/members` - Get playlist members
- `PUT /api/playlists/:id/members/:userId/role` - Update member role
- `DELETE /api/playlists/:id/members/:userId` - Remove member

### Audio Streaming
- `GET /api/stream/:trackId` - Stream audio content

## 🚢 Deployment

### Production Deployment (Render.com)

The application is deployed across three Render services:

1. **Frontend Service**
   - Repository: Your GitHub repository
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Auto-deployment enabled

2. **Backend Service**
   - Runtime: Node.js
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment variables configured for production

3. **PostgreSQL Database**
   - Managed PostgreSQL instance on Render
   - Location: Singapore (Asia)
   - Automated backups enabled

### Environment Configuration

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001  # Development
FRONTEND_URL=https://loopify-g41n.onrender.com  # Production
```

#### Backend (.env)
```env
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://...  # Render PostgreSQL
JWT_SECRET=your-secret-key
BASE_URL=https://loopify-backend-sshh.onrender.com
FRONTEND_URL=https://loopify-g41n.onrender.com
```

## 💻 Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd LoopifyFinal
   ```

2. **Install dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Frontend dependencies
   cd Loopify
   npm install
   
   # Backend dependencies
   cd ../Loopify/loopify-backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp Loopify/.env.example Loopify/.env
   cp Loopify/loopify-backend/.env.example Loopify/loopify-backend/.env
   ```

4. **Database Setup**
   ```bash
   # Initialize database
   cd Loopify/loopify-backend
   node setup-database.js
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd Loopify/loopify-backend
   npm run dev
   
   # Terminal 2: Frontend
   cd Loopify
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

## 🗃 Database Access

### Production Database

The database is deployed on Render's PostgreSQL service. To access it:

1. **Via Render Dashboard**
   - Go to your Render dashboard
   - Navigate to your PostgreSQL service
   - Use the "PSQL" tab to run queries

2. **Via Terminal (Local)**
   ```bash
   # Install PostgreSQL client if needed
   # On macOS: brew install postgresql
   
   # Connect using the DATABASE_URL from your .env file
   psql "postgresql://loopify_database_user:bRb5mZqjYTJFMuZxrgdY5fsQHmbVP6PN@dpg-d3i6k1odl3ps73cvachg-a.singapore-postgres.render.com/loopify_database"
   ```

3. **Common Queries**
   ```sql
   -- View all users
   SELECT * FROM Users;
   
   -- View all tracks
   SELECT * FROM Track LIMIT 10;
   
   -- View playlist statistics
   SELECT p.Title, COUNT(pi.TrackID) as track_count
   FROM Playlist p
   LEFT JOIN PlaylistItem pi ON p.PlaylistID = pi.PlaylistID
   GROUP BY p.PlaylistID;
   ```

### Migration from SQLite

The application was originally developed with SQLite and migrated to PostgreSQL for production deployment. Key changes:

- **Data Types**: Adjusted for PostgreSQL compatibility
- **Auto-increment**: Changed from SQLite `AUTOINCREMENT` to PostgreSQL `SERIAL`
- **Foreign Keys**: Maintained referential integrity
- **Performance**: Optimized queries for PostgreSQL

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Add comments for complex logic

### Database Changes
- Test all migrations thoroughly
- Update schema documentation
- Maintain backward compatibility when possible

## 📝 License

This project is for educational purposes as part of a database course assignment.

## 🙏 Acknowledgments

- **Jamendo API** for music data and streaming
- **Render.com** for hosting services
- **React Team** for the amazing framework
- **Express.js Community** for the robust backend framework

---

**Note**: This application was developed as part of a university database course project, demonstrating full-stack development skills with modern technologies and deployment practices.