import React, { useState, useEffect } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration?: string;
  album?: string;
  audioUrl?: string;
}

interface Artist {
  id: number;
  name: string;
  avatar: string;
  followers?: string;
}

interface ArtistPageProps {
  artist: Artist;
  onBackClick: () => void;
  onSongSelect: (song: Song) => void;
}

const ArtistPage: React.FC<ArtistPageProps> = ({ artist, onBackClick, onSongSelect }) => {
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSong, setHoveredSong] = useState<number | null>(null);

  useEffect(() => {
    const fetchArtistSongs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5001/api/jamendo/tracks?limit=50');
        const allTracks = await response.json();
        
        const filteredSongs = allTracks
          .filter((track: Song) => track.artist.toLowerCase() === artist.name.toLowerCase())
          .map((track: Song) => ({
            ...track,
            audioUrl: `http://localhost:5001/api/stream/${track.id}`
          }));
        
        setArtistSongs(filteredSongs);
      } catch (error) {
        console.error('Failed to fetch artist songs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtistSongs();
  }, [artist.name]);
  useEffect(() => {
    const fetchArtistSongs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5001/api/jamendo/artists/${artist.id}/tracks`);
        const tracks = await response.json();
        setArtistSongs(tracks);
      } catch (error) {
        console.error('Failed to fetch artist songs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtistSongs();
  }, [artist.id]);
  return (
    <>
      <style>{artistPageStyles}</style>
      <div className="artist-page">
        {/* Enhanced Header */}
        <div className="artist-header">
          <div className="header-bg" style={{ backgroundImage: `url(${artist.avatar})` }}></div>
          <div className="header-gradient"></div>
          
          <div className="header-content">
            <button className="back-button" onClick={onBackClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back
            </button>
            
            <div className="artist-profile">
              <div className="avatar-container">
                <img src={artist.avatar} alt={artist.name} className="artist-avatar" />
                <div className="avatar-ring"></div>
              </div>
              
              <div className="artist-details">
                <span className="verified-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Verified Artist
                </span>
                <h1 className="artist-name">{artist.name}</h1>
                <div className="artist-stats">
                  <span className="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                    {artist.followers || '10K+ followers'}
                  </span>
                  <span className="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    {artistSongs.length} tracks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="artist-content">
          <div className="content-header">
            <h2 className="section-title">Popular Tracks</h2>
            <button className="shuffle-all-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
              </svg>
              Shuffle Play
            </button>
          </div>
          
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading tracks...</p>
            </div>
          ) : artistSongs.length > 0 ? (
            <div className="songs-list">
              {artistSongs.map((song, index) => (
                <div 
                  key={song.id} 
                  className={`song-row ${hoveredSong === song.id ? 'hovered' : ''}`}
                  onClick={() => onSongSelect(song)}
                  onMouseEnter={() => setHoveredSong(song.id)}
                  onMouseLeave={() => setHoveredSong(null)}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="song-index">
                    {hoveredSong === song.id ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="song-cover-wrapper">
                    <img src={song.cover} alt={song.title} className="song-cover" />
                    <div className="cover-overlay">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="song-details">
                    <h3 className="song-title">{song.title}</h3>
                    <p className="song-album">{song.album || 'Single'}</p>
                  </div>
                  
                  <div className="song-actions">
                    <button className="action-btn" onClick={(e) => e.stopPropagation()}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                    <span className="song-duration">{song.duration}</span>
                    <button className="action-btn" onClick={(e) => e.stopPropagation()}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <h3>No tracks available</h3>
              <p>This artist doesn't have any tracks in our library yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const artistPageStyles = `
body, html {
    margin: 0;
    padding: 0;
    background-color: #000; 
}
  .artist-page {
    min-height: 100vh;
    background: #000;
    color: white;
    overflow-y: auto;
  }
  
  .artist-header {
    position: relative;
    height: 450px;
    overflow: hidden;
  }
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    filter: blur(80px) brightness(0.4);
    transform: scale(1.2);
  }
  
  .header-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(to bottom, transparent, #000);
  }
  
  .header-content {
    position: relative;
    height: 100%;
    padding: 30px 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .back-button {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
    width: fit-content;
  }
  
  .back-button:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateX(-4px);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .artist-profile {
    display: flex;
    align-items: flex-end;
    gap: 40px;
  }
  
  .avatar-container {
    position: relative;
  }
  
  .artist-avatar {
    width: 230px;
    height: 230px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    border: 4px solid rgba(255, 255, 255, 0.1);
  }
  
  .avatar-ring {
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: linear-gradient(45deg, #1db954, #1ed760, #1db954);
    opacity: 0;
    animation: pulse 3s ease-in-out infinite;
    z-index: -1;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
  }
  
  .artist-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 30px;
  }
  
  .verified-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #1db954;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .verified-badge svg {
    fill: #1db954;
  }
  
  .artist-name {
    font-size: 80px;
    font-weight: 900;
    margin: 0;
    line-height: 1;
    letter-spacing: -2px;
    background: linear-gradient(to bottom, #fff, #b3b3b3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .artist-stats {
    display: flex;
    gap: 24px;
    margin-top: 8px;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    color: #b3b3b3;
    font-weight: 500;
  }
  
  .stat-item svg {
    opacity: 0.7;
  }
  
  .artist-content {
    padding: 40px 60px 80px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .section-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
  }
  
  .shuffle-all-btn {
    background: #1db954;
    border: none;
    color: #000;
    padding: 14px 32px;
    border-radius: 30px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s;
  }
  
  .shuffle-all-btn:hover {
    background: #1ed760;
    transform: scale(1.05);
  }
  
  .shuffle-all-btn:active {
    transform: scale(0.98);
  }
  
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 80px 0;
  }
  
  .loading-spinner {
    width: 60px;
    height: 60px;
    border: 5px solid rgba(29, 185, 84, 0.1);
    border-top-color: #1db954;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    font-size: 16px;
    color: #b3b3b3;
    margin: 0;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .songs-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .song-row {
    display: grid;
    grid-template-columns: 50px 70px 1fr auto;
    align-items: center;
    gap: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    transition: all 0.2s;
    cursor: pointer;
    opacity: 0;
    animation: slideUp 0.4s ease forwards;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .song-row:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  
  .song-row.hovered .song-cover-wrapper .cover-overlay {
    opacity: 1;
  }
  
  .song-index {
    text-align: center;
    font-size: 16px;
    color: #b3b3b3;
    font-weight: 500;
    width: 30px;
  }
  
  .song-row.hovered .song-index svg {
    fill: #1db954;
  }
  
  .song-cover-wrapper {
    position: relative;
    width: 56px;
    height: 56px;
  }
  
  .song-cover {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    object-fit: cover;
  }
  
  .cover-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .cover-overlay svg {
    fill: white;
  }
  
  .song-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  
  .song-title {
    font-size: 16px;
    font-weight: 500;
    color: white;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .song-row:hover .song-title {
    color: #1db954;
  }
  
  .song-album {
    font-size: 14px;
    color: #b3b3b3;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .song-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .action-btn {
    background: none;
    border: none;
    color: #b3b3b3;
    cursor: pointer;
    padding: 8px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .action-btn:hover {
    color: white;
    transform: scale(1.1);
  }
  
  .song-duration {
    font-size: 14px;
    color: #b3b3b3;
    min-width: 50px;
    text-align: right;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 80px 20px;
    text-align: center;
  }
  
  .empty-state svg {
    fill: #282828;
  }
  
  .empty-state h3 {
    font-size: 22px;
    font-weight: 700;
    margin: 0;
  }
  
  .empty-state p {
    font-size: 16px;
    color: #b3b3b3;
    margin: 0;
  }
  
  @media (max-width: 1024px) {
    .artist-name {
      font-size: 60px;
    }
    
    .artist-avatar {
      width: 180px;
      height: 180px;
    }
  }
  
  @media (max-width: 768px) {
    .header-content {
      padding: 20px 30px;
    }
    
    .artist-profile {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 20px;
    }
    
    .artist-name {
      font-size: 40px;
    }
    
    .artist-avatar {
      width: 150px;
      height: 150px;
    }
    
    .artist-stats {
      justify-content: center;
    }
    
    .artist-content {
      padding: 30px 20px;
    }
    
    .song-row {
      grid-template-columns: 40px 50px 1fr;
      gap: 12px;
    }
    
    .song-actions {
      display: none;
    }
  }
`;

export default ArtistPage;