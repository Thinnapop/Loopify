-- Loopify Database Schema and Sample Data
-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS MoodSession CASCADE;
DROP TABLE IF EXISTS UserTrackStat CASCADE;
DROP TABLE IF EXISTS PlaylistItem CASCADE;
DROP TABLE IF EXISTS Alert CASCADE;
DROP TABLE IF EXISTS UserArtistFollow CASCADE;
DROP TABLE IF EXISTS Listening CASCADE;
DROP TABLE IF EXISTS PlaylistMember CASCADE;
DROP TABLE IF EXISTS ArtistTrack CASCADE;
DROP TABLE IF EXISTS Playlist CASCADE;
DROP TABLE IF EXISTS Track CASCADE;
DROP TABLE IF EXISTS Mood CASCADE;
DROP TABLE IF EXISTS Person CASCADE;
DROP TABLE IF EXISTS GroupArtist CASCADE;
DROP TABLE IF EXISTS Artist CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- Create Users table
CREATE TABLE Users (
    UserID VARCHAR(50) PRIMARY KEY,
    DisplayName VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Language VARCHAR(10) DEFAULT 'en',
    Country VARCHAR(50),
    Timezone VARCHAR(50) DEFAULT 'UTC',
    Status VARCHAR(20) DEFAULT 'active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Mood table
CREATE TABLE Mood (
    MoodID VARCHAR(50) PRIMARY KEY,
    FeelingName VARCHAR(50) UNIQUE NOT NULL
);

-- Create Artist table (superclass)
CREATE TABLE Artist (
    ArtistID VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(150) NOT NULL,
    Country VARCHAR(50),
    DebutYear INT,
    Followers INT DEFAULT 0,
    ImageURL VARCHAR(500),
    ArtistType VARCHAR(20) CHECK (ArtistType IN ('person', 'group'))
);

-- Create Person table (subclass of Artist)
CREATE TABLE Person (
    ArtistID VARCHAR(50) PRIMARY KEY,
    Gender VARCHAR(20),
    Rating DECIMAL(3,2),
    DateOfBirth DATE,
    FOREIGN KEY (ArtistID) REFERENCES Artist(ArtistID) ON DELETE CASCADE
);

-- Create Group table (subclass of Artist)
CREATE TABLE GroupArtist (
    ArtistID VARCHAR(50) PRIMARY KEY,
    GroupSize INT,
    LeaderName VARCHAR(100),
    FOREIGN KEY (ArtistID) REFERENCES Artist(ArtistID) ON DELETE CASCADE
);

-- Create Track table
CREATE TABLE Track (
    TrackID VARCHAR(50) PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    DurationMs INT,
    ExplicitFlag BOOLEAN DEFAULT FALSE,
    ReleaseDate DATE,
    Genre VARCHAR(50),
    Album VARCHAR(200),
    CoverURL VARCHAR(500),
    AudioURL VARCHAR(500)
);

-- Create ArtistTrack table (M:N relationship)
CREATE TABLE ArtistTrack (
    ArtistID VARCHAR(50),
    TrackID VARCHAR(50),
    Role VARCHAR(50) DEFAULT 'primary',
    PRIMARY KEY (ArtistID, TrackID),
    FOREIGN KEY (ArtistID) REFERENCES Artist(ArtistID) ON DELETE CASCADE,
    FOREIGN KEY (TrackID) REFERENCES Track(TrackID) ON DELETE CASCADE
);

-- Create Playlist table
CREATE TABLE Playlist (
    PlaylistID VARCHAR(50) PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    Visibility VARCHAR(20) CHECK (Visibility IN ('private', 'shared', 'public')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatorID VARCHAR(50),
    FOREIGN KEY (CreatorID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- Create PlaylistMember table (M:N relationship with role)
CREATE TABLE PlaylistMember (
    PlaylistID VARCHAR(50),
    UserID VARCHAR(50),
    Role VARCHAR(20) CHECK (Role IN ('owner', 'editor', 'viewer')),
    JoinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (PlaylistID, UserID),
    FOREIGN KEY (PlaylistID) REFERENCES Playlist(PlaylistID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Create PlaylistItem table
CREATE TABLE PlaylistItem (
    ListItemID VARCHAR(50) PRIMARY KEY,
    PlaylistID VARCHAR(50),
    TrackID VARCHAR(50),
    AddedByUserID VARCHAR(50),
    AddedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Position INT,
    FOREIGN KEY (PlaylistID) REFERENCES Playlist(PlaylistID) ON DELETE CASCADE,
    FOREIGN KEY (TrackID) REFERENCES Track(TrackID) ON DELETE CASCADE,
    FOREIGN KEY (AddedByUserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- Create Listening table (M:N relationship)
CREATE TABLE Listening (
    UserID VARCHAR(50),
    TrackID VARCHAR(50),
    Device VARCHAR(50),
    ListenedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID, TrackID, ListenedAt),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (TrackID) REFERENCES Track(TrackID) ON DELETE CASCADE
);

-- Create UserArtistFollow table
CREATE TABLE UserArtistFollow (
    UserID VARCHAR(50),
    ArtistID VARCHAR(50),
    FollowedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    AlertEnabled BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (UserID, ArtistID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ArtistID) REFERENCES Artist(ArtistID) ON DELETE CASCADE
);

-- Create Alert table
CREATE TABLE Alert (
    AlertID VARCHAR(50) PRIMARY KEY,
    UserID VARCHAR(50),
    TrackID VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Channel VARCHAR(20) CHECK (Channel IN ('email', 'push', 'inapp')),
    State VARCHAR(20) CHECK (State IN ('queued', 'sent', 'failed')),
    DeliveredAt TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (TrackID) REFERENCES Track(TrackID) ON DELETE CASCADE
);

-- Create UserTrackStat table
CREATE TABLE UserTrackStat (
    UserID VARCHAR(50),
    TrackID VARCHAR(50),
    PlayCount INT DEFAULT 0,
    LikeCount INT DEFAULT 0,
    AddCount INT DEFAULT 0,
    SkipCount INT DEFAULT 0,
    LastEventAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID, TrackID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (TrackID) REFERENCES Track(TrackID) ON DELETE CASCADE
);

-- Create MoodSession table
CREATE TABLE MoodSession (
    SessionID VARCHAR(50) PRIMARY KEY,
    UserID VARCHAR(50),
    MoodID VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TargetDurationMin INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (MoodID) REFERENCES Mood(MoodID) ON DELETE CASCADE
);

-- Insert sample data

-- Insert Users
INSERT INTO Users (UserID, DisplayName, Email, Password, Language, Country, Status) VALUES
('user_001', 'John Smith', 'john.smith@email.com', '$2a$10$hash1', 'en', 'USA', 'active'),
('user_002', 'Sarah Johnson', 'sarah.j@email.com', '$2a$10$hash2', 'en', 'UK', 'active'),
('user_003', 'Mike Chen', 'mike.chen@email.com', '$2a$10$hash3', 'en', 'Canada', 'active'),
('user_004', 'Emma Wilson', 'emma.w@email.com', '$2a$10$hash4', 'en', 'Australia', 'active'),
('user_005', 'Carlos Rodriguez', 'carlos.r@email.com', '$2a$10$hash5', 'es', 'Spain', 'active'),
('user_006', 'Yuki Tanaka', 'yuki.t@email.com', '$2a$10$hash6', 'ja', 'Japan', 'active'),
('user_007', 'Lisa Anderson', 'lisa.a@email.com', '$2a$10$hash7', 'en', 'USA', 'active'),
('user_008', 'Tom Brown', 'tom.b@email.com', '$2a$10$hash8', 'en', 'UK', 'active');

-- Insert Moods
INSERT INTO Mood (MoodID, FeelingName) VALUES
('mood_001', 'Happy'),
('mood_002', 'Sad'),
('mood_003', 'Energetic'),
('mood_004', 'Relaxed'),
('mood_005', 'Focused'),
('mood_006', 'Romantic'),
('mood_007', 'Party'),
('mood_008', 'Melancholic');

-- Insert Artists
INSERT INTO Artist (ArtistID, Name, Country, DebutYear, Followers, ArtistType) VALUES
('artist_001', 'The Weeknd', 'Canada', 2010, 95000000, 'person'),
('artist_002', 'Taylor Swift', 'USA', 2006, 92000000, 'person'),
('artist_003', 'BTS', 'South Korea', 2013, 73000000, 'group'),
('artist_004', 'Ed Sheeran', 'UK', 2011, 88000000, 'person'),
('artist_005', 'Billie Eilish', 'USA', 2016, 71000000, 'person'),
('artist_006', 'Drake', 'Canada', 2009, 78000000, 'person'),
('artist_007', 'Imagine Dragons', 'USA', 2008, 45000000, 'group'),
('artist_008', 'Dua Lipa', 'UK', 2015, 55000000, 'person'),
('artist_009', 'Post Malone', 'USA', 2015, 58000000, 'person'),
('artist_010', 'Maroon 5', 'USA', 2001, 40000000, 'group');

-- Insert ArtistTrack relationships
INSERT INTO ArtistTrack (ArtistID, TrackID, Role) VALUES
('artist_001', 'track_001', 'primary'), -- The Weeknd - Bohemian Rhapsody (cover)
('artist_007', 'track_002', 'primary'), -- Imagine Dragons - Hotel California (cover)
('artist_007', 'track_003', 'primary'), -- Imagine Dragons - Stairway to Heaven (cover)
('artist_002', 'track_004', 'primary'), -- Taylor Swift - Imagine (cover)
('artist_009', 'track_005', 'primary'), -- Post Malone - Billie Jean (cover)
('artist_005', 'track_006', 'primary'), -- Billie Eilish - Smells Like Teen Spirit (cover)
('artist_006', 'track_007', 'primary'), -- Drake - Sweet Child O Mine (cover)
('artist_008', 'track_008', 'primary'), -- Dua Lipa - Like a Prayer (cover)
('artist_004', 'track_009', 'primary'), -- Ed Sheeran - Wonderwall (cover)
('artist_003', 'track_010', 'primary'), -- BTS - Purple Rain (cover)
('artist_001', 'track_011', 'primary'), -- The Weeknd - New Release Track 1
('artist_006', 'track_012', 'primary'); -- Drake - New Release Track 2

-- Insert Person details
INSERT INTO Person (ArtistID, Gender, Rating, DateOfBirth) VALUES
('artist_001', 'Male', 4.8, '1990-02-16'),
('artist_002', 'Female', 4.9, '1989-12-13'),
('artist_004', 'Male', 4.7, '1991-02-17'),
('artist_005', 'Female', 4.8, '2001-12-18'),
('artist_006', 'Male', 4.6, '1986-10-24'),
('artist_008', 'Female', 4.7, '1995-08-22'),
('artist_009', 'Male', 4.5, '1995-07-04');

-- Insert Group details
INSERT INTO GroupArtist (ArtistID, GroupSize, LeaderName) VALUES
('artist_003', 7, 'RM'),
('artist_007', 4, 'Dan Reynolds'),
('artist_010', 5, 'Adam Levine');

-- Insert Tracks
INSERT INTO Track (TrackID, Title, DurationMs, ExplicitFlag, ReleaseDate, Genre, Album, CoverURL, AudioURL) VALUES
('track_001', 'Bohemian Rhapsody', 355000, FALSE, '1975-10-31', 'Rock', 'A Night at the Opera', 'https://picsum.photos/300/300?random=1', 'https://example.com/audio1.mp3'),
('track_002', 'Hotel California', 391000, FALSE, '1976-12-08', 'Rock', 'Hotel California', 'https://picsum.photos/300/300?random=2', 'https://example.com/audio2.mp3'),
('track_003', 'Stairway to Heaven', 482000, FALSE, '1971-11-08', 'Rock', 'Led Zeppelin IV', 'https://picsum.photos/300/300?random=3', 'https://example.com/audio3.mp3'),
('track_004', 'Imagine', 183000, FALSE, '1971-10-11', 'Pop', 'Imagine', 'https://picsum.photos/300/300?random=4', 'https://example.com/audio4.mp3'),
('track_005', 'Billie Jean', 294000, FALSE, '1982-11-30', 'Pop', 'Thriller', 'https://picsum.photos/300/300?random=5', 'https://example.com/audio5.mp3'),
('track_006', 'Smells Like Teen Spirit', 301000, FALSE, '1991-09-10', 'Grunge', 'Nevermind', 'https://picsum.photos/300/300?random=6', 'https://example.com/audio6.mp3'),
('track_007', 'Sweet Child O Mine', 356000, FALSE, '1987-07-21', 'Rock', 'Appetite for Destruction', 'https://picsum.photos/300/300?random=7', 'https://example.com/audio7.mp3'),
('track_008', 'Like a Prayer', 313000, FALSE, '1989-03-03', 'Pop', 'Like a Prayer', 'https://picsum.photos/300/300?random=8', 'https://example.com/audio8.mp3'),
('track_009', 'Wonderwall', 258000, FALSE, '1995-10-30', 'Britpop', '(What\'s the Story) Morning Glory?', 'https://picsum.photos/300/300?random=9', 'https://example.com/audio9.mp3'),
('track_010', 'Purple Rain', 521000, FALSE, '1984-06-25', 'Pop', 'Purple Rain', 'https://picsum.photos/300/300?random=10', 'https://example.com/audio10.mp3'),
('track_011', 'New Release Track 1', 210000, FALSE, '2025-01-15', 'Pop', 'New Album', 'https://picsum.photos/300/300?random=11', 'https://example.com/audio11.mp3'),
('track_012', 'New Release Track 2', 195000, FALSE, '2025-01-20', 'Hip Hop', 'Latest Hits', 'https://picsum.photos/300/300?random=12', 'https://example.com/audio12.mp3');

-- Insert Playlists (including collaborative ones)
INSERT INTO Playlist (PlaylistID, Title, Description, Visibility, CreatorID) VALUES
('playlist_001', 'Summer Vibes 2025', 'Collaborative summer playlist with friends!', 'shared', 'user_001'),
('playlist_002', 'Workout Energy', 'High energy tracks for gym sessions', 'public', 'user_002'),
('playlist_003', 'Study Focus', 'Calm music for concentration', 'private', 'user_003'),
('playlist_004', 'Road Trip Mix', 'Perfect for long drives', 'shared', 'user_004'),
('playlist_005', 'Party Hits', 'Collaborative party playlist', 'shared', 'user_001');

-- Insert PlaylistMember relationships (for collaborative playlists)
INSERT INTO PlaylistMember (PlaylistID, UserID, Role) VALUES
-- Summer Vibes 2025 (collaborative)
('playlist_001', 'user_001', 'owner'),
('playlist_001', 'user_002', 'editor'),
('playlist_001', 'user_003', 'editor'),
('playlist_001', 'user_004', 'viewer'),
-- Workout Energy
('playlist_002', 'user_002', 'owner'),
-- Study Focus
('playlist_003', 'user_003', 'owner'),
-- Road Trip Mix
('playlist_004', 'user_004', 'owner'),
('playlist_004', 'user_005', 'editor'),
-- Party Hits (collaborative)
('playlist_005', 'user_001', 'owner'),
('playlist_005', 'user_002', 'editor'),
('playlist_005', 'user_006', 'editor'),
('playlist_005', 'user_007', 'viewer');

-- Insert PlaylistItem entries
INSERT INTO PlaylistItem (ListItemID, PlaylistID, TrackID, AddedByUserID, Position) VALUES
-- Summer Vibes playlist
('item_001', 'playlist_001', 'track_001', 'user_001', 1),
('item_002', 'playlist_001', 'track_008', 'user_002', 2),
('item_003', 'playlist_001', 'track_004', 'user_003', 3),
('item_004', 'playlist_001', 'track_009', 'user_001', 4),
-- Workout Energy playlist
('item_005', 'playlist_002', 'track_007', 'user_002', 1),
('item_006', 'playlist_002', 'track_003', 'user_002', 2),
-- Party Hits playlist
('item_007', 'playlist_005', 'track_001', 'user_001', 1),
('item_008', 'playlist_005', 'track_003', 'user_002', 2),
('item_009', 'playlist_005', 'track_008', 'user_006', 3),
('item_010', 'playlist_005', 'track_006', 'user_002', 4);

-- Insert UserArtistFollow (for alert system)
INSERT INTO UserArtistFollow (UserID, ArtistID, AlertEnabled) VALUES
('user_001', 'artist_001', true),
('user_001', 'artist_002', true),
('user_001', 'artist_005', false),
('user_002', 'artist_003', true),
('user_002', 'artist_004', true),
('user_003', 'artist_001', true),
('user_003', 'artist_008', true),
('user_004', 'artist_006', true),
('user_005', 'artist_007', true),
('user_006', 'artist_003', true);

-- Insert Alerts for new releases
INSERT INTO Alert (AlertID, UserID, TrackID, Channel, State, DeliveredAt) VALUES
('alert_001', 'user_001', 'track_011', 'push', 'sent', '2025-09-25 10:00:00'),
('alert_002', 'user_001', 'track_012', 'inapp', 'queued', NULL),
('alert_003', 'user_003', 'track_011', 'email', 'sent', '2025-09-25 10:05:00');

-- Insert Listening history
INSERT INTO Listening (UserID, TrackID, Device) VALUES
('user_001', 'track_001', 'mobile'),
('user_001', 'track_002', 'web'),
('user_001', 'track_004', 'mobile'),
('user_002', 'track_003', 'web'),
('user_002', 'track_007', 'mobile'),
('user_003', 'track_001', 'desktop'),
('user_003', 'track_008', 'mobile');

-- Insert UserTrackStat for recommendations
INSERT INTO UserTrackStat (UserID, TrackID, PlayCount, LikeCount, AddCount, SkipCount) VALUES
('user_001', 'track_001', 45, 1, 1, 2),
('user_001', 'track_002', 23, 1, 1, 0),
('user_001', 'track_004', 15, 0, 1, 5),
('user_002', 'track_003', 67, 1, 1, 0),
('user_002', 'track_007', 34, 1, 1, 1),
('user_003', 'track_001', 89, 1, 0, 0),
('user_003', 'track_008', 56, 1, 1, 3);

-- Insert MoodSession examples
INSERT INTO MoodSession (SessionID, UserID, MoodID, TargetDurationMin) VALUES
('session_001', 'user_001', 'mood_001', 60),
('session_002', 'user_002', 'mood_003', 45),
('session_003', 'user_003', 'mood_005', 120);

-- Create indexes for better performance
CREATE INDEX idx_user_email ON Users(Email);
CREATE INDEX idx_track_release ON Track(ReleaseDate);
CREATE INDEX idx_playlist_visibility ON Playlist(Visibility);
CREATE INDEX idx_alert_user ON Alert(UserID);
CREATE INDEX idx_alert_state ON Alert(State);
CREATE INDEX idx_follow_user ON UserArtistFollow(UserID);
CREATE INDEX idx_stats_user ON UserTrackStat(UserID);
CREATE INDEX idx_listening_user ON Listening(UserID);

-- Create a view for popular tracks
CREATE VIEW PopularTracks AS
SELECT 
    t.TrackID,
    t.Title,
    a.Name as ArtistName,
    t.Genre,
    SUM(uts.PlayCount) as TotalPlays,
    SUM(uts.LikeCount) as TotalLikes
FROM Track t
JOIN ArtistTrack at ON t.TrackID = at.TrackID
JOIN Artist a ON at.ArtistID = a.ArtistID
LEFT JOIN UserTrackStat uts ON t.TrackID = uts.TrackID
GROUP BY t.TrackID, t.Title, a.Name, t.Genre
ORDER BY TotalPlays DESC;

-- Create a view for collaborative playlists
CREATE VIEW CollaborativePlaylists AS
SELECT 
    p.PlaylistID,
    p.Title,
    p.Description,
    p.Visibility,
    COUNT(DISTINCT pm.UserID) as MemberCount,
    COUNT(DISTINCT pi.TrackID) as TrackCount
FROM Playlist p
JOIN PlaylistMember pm ON p.PlaylistID = pm.PlaylistID
LEFT JOIN PlaylistItem pi ON p.PlaylistID = pi.PlaylistID
WHERE p.Visibility IN ('shared', 'public')
GROUP BY p.PlaylistID, p.Title, p.Description, p.Visibility
HAVING COUNT(DISTINCT pm.UserID) > 1;