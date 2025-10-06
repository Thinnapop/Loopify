import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import { API_BASE_URL } from '../config';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
// --- API Configuration ---
// Using centralized config from ../config.ts

interface Song {
  id: number;
  title: string;
  artist_name: string;
  cover_image_url: string;
  duration?: string;
  album?: string;
  play_count?: number;
}

interface Artist {
  id: number;
  name: string;
  type: string;
  avatar_url: string;
  followers_count?: number;
}

interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Add this at the top of the component
useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch trending songs
      const songsResponse = await fetch(`${API_BASE_URL}/songs/trending`);
      const songs = await songsResponse.json();
      setAllTrendingSongs(songs);
      
      // Fetch popular artists
      const artistsResponse = await fetch(`${API_BASE_URL}/artists/popular`);
      const artists = await artistsResponse.json();
      setAllPopularArtists(artists);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  fetchData();
}, []);
// --- API FUNCTIONS ---
const apiService = {
  async fetchTrendingSongs(page: number = 1, limit: number = 5): Promise<ApiResponse<Song>> {
    try {
      const response = await fetch(`${API_BASE_URL}/songs/trending?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch trending songs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching trending songs:', error);
      return {
        data: [
          { id: 1, title: 'Blinding Lights', artist_name: 'The Weeknd', cover_image_url: 'https://picsum.photos/200?random=1', duration: '3:20' },
          { id: 2, title: 'Shape of You', artist_name: 'Ed Sheeran', cover_image_url: 'https://picsum.photos/200?random=2', duration: '3:53' },
          { id: 3, title: 'Someone You Loved', artist_name: 'Lewis Capaldi', cover_image_url: 'https://picsum.photos/200?random=3', duration: '3:02' },
          { id: 4, title: 'Dance Monkey', artist_name: 'Tones and I', cover_image_url: 'https://picsum.photos/200?random=4', duration: '3:29' },
          { id: 5, title: 'Rockstar', artist_name: 'Post Malone ft. 21 Savage', cover_image_url: 'https://picsum.photos/200?random=5', duration: '3:38' },
        ],
        total: 21,
        page: 1,
        totalPages: 5
      };
    }
  },

  async fetchPopularArtists(page: number = 1, limit: number = 5): Promise<ApiResponse<Artist>> {
    try {
      const response = await fetch(`${API_BASE_URL}/artists/popular?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch popular artists');
      return await response.json();
    } catch (error) {
      console.error('Error fetching popular artists:', error);
      // Return mock data as fallback
      return {
        data: [
          { id: 1, name: 'Taylor Swift', type: 'Artist', avatar_url: 'https://picsum.photos/200?random=101', followers_count: 92000000 },
          { id: 2, name: 'Drake', type: 'Artist', avatar_url: 'https://picsum.photos/200?random=102', followers_count: 78000000 },
          { id: 3, name: 'Bad Bunny', type: 'Artist', avatar_url: 'https://picsum.photos/200?random=103', followers_count: 67000000 },
          { id: 4, name: 'The Weeknd', type: 'Artist', avatar_url: 'https://picsum.photos/200?random=104', followers_count: 95000000 },
          { id: 5, name: 'Ariana Grande', type: 'Artist', avatar_url: 'https://picsum.photos/200?random=105', followers_count: 85000000 },
        ],
        total: 14,
        page: 1,
        totalPages: 3
      };
    }
  },

  async playSong(songId: number): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/songs/${songId}/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error tracking song play:', error);
    }
  }
};

// --- UTILITY FUNCTIONS ---
const formatFollowers = (count: number): string => {
  if (count >= 1000000) {
    return `${Math.floor(count / 1000000)}M followers`;
  } else if (count >= 1000) {
    return `${Math.floor(count / 1000)}K followers`;
  }
  return `${count} followers`;
};

// --- STYLES ---
const contentStyles = `
  .main-content {
    flex: 1;
    padding: 20px;
    color: white;
    overflow-y: auto;
    background-color: #121212;
    margin-left: 15px;
    margin-right: 15px;
    border-radius: 20px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .section-title-wrapper {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .content-title {
    font-size: 24px;
    font-weight: bold;
  }
  
  .loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #1db954;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    color: #ff6b6b;
    font-size: 14px;
    margin-left: 10px;
  }
  
  .navigation-buttons {
    display: flex;
    gap: 12px;
  }
  
  .arrow-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .arrow-button:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  .arrow-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .show-all {
    font-size: 14px;
    font-weight: normal;
    color: #b3b3b3;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  
  .show-all:hover {
    color: white;
    text-decoration: underline;
  }
  
  .carousel-container {
    position: relative;
    overflow: hidden;
    padding: 4px 0;
  }
  
  .carousel-slide {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    padding: 0 8px;
  }
  
  .song-card {
    background-color: #181818;
    border-radius: 8px;
    padding: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    min-height: 280px;
  }
  
  .song-card:hover {
    background-color: #282828;
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  
  .song-card img {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    margin-bottom: 12px;
    object-fit: cover;
  }
  
  .song-card h3 {
    font-size: 14px;
    margin: 0 0 4px 0;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
  }
  
  .song-card p {
    font-size: 12px;
    margin: 0;
    color: #b3b3b3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .play-button-overlay {
    position: absolute;
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    background-color: #1db954;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .song-card:hover .play-button-overlay {
    opacity: 1;
    transform: translateY(0);
  }
  
  .play-icon {
    color: white;
    font-size: 16px;
    margin-left: 2px;
  }
  
  .artist-card {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .artist-card img {
    border-radius: 50%;
  }
  
  .pagination-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #b3b3b3;
    font-size: 14px;
  }
  
  .pagination-dots {
    display: flex;
    gap: 6px;
  }
  
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .dot.active {
    background-color: #1db954;
    width: 20px;
    border-radius: 3px;
  }
  
  @media (max-width: 1400px) {
    .carousel-slide {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  @media (max-width: 1200px) {
    .carousel-slide {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 900px) {
    .carousel-slide {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 600px) {
    .carousel-slide {
      grid-template-columns: repeat(1, 1fr);
    }
  }
`;

// --- MAIN COMPONENT ---
const MainContent: React.FC = () => {
  // State management
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songPage, setSongPage] = useState(1);
  const [artistPage, setArtistPage] = useState(1);
  const [totalSongPages, setTotalSongPages] = useState(1);
  const [totalArtistPages, setTotalArtistPages] = useState(1);
  const [loading, setLoading] = useState({ songs: true, artists: true });
  const [errors, setErrors] = useState({ songs: '', artists: '' });
  
  // This should be INSIDE MainContent component
useEffect(() => {
  const fetchData = async () => {
    try {
      const songsResponse = await fetch(`${API_BASE_URL}/songs/trending`);
      const songs = await songsResponse.json();
      setAllTrendingSongs(songs);
      
      const artistsResponse = await fetch(`${API_BASE_URL}/artists/popular`);
      const artists = await artistsResponse.json();
      setAllPopularArtists(artists);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  fetchData();
}, []);
  // Load songs data
  const loadSongs = async (page: number) => {
    setLoading(prev => ({ ...prev, songs: true }));
    setErrors(prev => ({ ...prev, songs: '' }));
    
    try {
      const response = await apiService.fetchTrendingSongs(page, 5);
      setSongs(response.data);
      setTotalSongPages(response.totalPages);
    } catch (error) {
      setErrors(prev => ({ ...prev, songs: 'Failed to load songs' }));
    } finally {
      setLoading(prev => ({ ...prev, songs: false }));
    }
  };

  // Load artists data
  const loadArtists = async (page: number) => {
    setLoading(prev => ({ ...prev, artists: true }));
    setErrors(prev => ({ ...prev, artists: '' }));
    
    try {
      const response = await apiService.fetchPopularArtists(page, 5);
      setArtists(response.data);
      setTotalArtistPages(response.totalPages);
    } catch (error) {
      setErrors(prev => ({ ...prev, artists: 'Failed to load artists' }));
    } finally {
      setLoading(prev => ({ ...prev, artists: false }));
    }
  };

  // Initial data loading
  useEffect(() => {
    loadSongs(1);
    loadArtists(1);
  }, []);

  // Navigation handlers
  const handleSongPageChange = (newPage: number) => {
    setSongPage(newPage);
    loadSongs(newPage);
  };

  const handleArtistPageChange = (newPage: number) => {
    setArtistPage(newPage);
    loadArtists(newPage);
  };

  // Play song handler
  const handlePlaySong = async (song: Song) => {
    console.log('Playing:', song.title, 'by', song.artist_name);
    await apiService.playSong(song.id);
    // Here you would implement actual playback logic
  };

  // View artist handler
  const handleViewArtist = (artist: Artist) => {
    console.log('Viewing artist:', artist.name);
    // Here you would navigate to artist page
  };

  return (
    <>
      <style>{contentStyles}</style>
      <div className="main-content">
        {/* Trending Songs Section */}
        <section style={{ marginBottom: '40px' }}>
          <div className="section-header">
            <div className="section-title-wrapper">
              <span className="content-title">Trending songs</span>
              {loading.songs && <div className="loading-spinner"></div>}
              {errors.songs && <span className="error-message">{errors.songs}</span>}
              <div className="pagination-info">
                <span>Page {songPage} of {totalSongPages}</span>
                <div className="pagination-dots">
                  {Array.from({ length: totalSongPages }, (_, i) => (
                    <div 
                      key={i} 
                      className={`dot ${i + 1 === songPage ? 'active' : ''}`}
                      onClick={() => handleSongPageChange(i + 1)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="navigation-buttons">
                <button 
                  className="arrow-button"
                  onClick={() => handleSongPageChange(Math.max(1, songPage - 1))}
                  disabled={songPage === 1 || loading.songs}
                  title="Previous"
                >
                  <span>←</span>
                </button>
                <button 
                  className="arrow-button"
                  onClick={() => handleSongPageChange(Math.min(totalSongPages, songPage + 1))}
                  disabled={songPage === totalSongPages || loading.songs}
                  title="Next"
                >
                  <span>→</span>
                </button>
              </div>
              <span className="show-all">Show all</span>
            </div>
          </div>
          
          <div className="carousel-container">
            <div className="carousel-slide">
              {songs.map((song, index) => (
                <div 
                  key={song.id} 
                  className="song-card"
                  onClick={() => handlePlaySong(song)}
                >
                  <div>
                    <img src={song.cover_image_url} alt={song.title} />
                    <div className="play-button-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                  </div>
                  <h3>{song.title}</h3>
                  <p>{song.artist_name}</p>
                  {song.duration && (
                    <p style={{ fontSize: '11px', marginTop: '4px', opacity: '0.7' }}>
                      {song.duration}
                    </p>
                  )}
                  {song.play_count && (
                    <p style={{ fontSize: '10px', marginTop: '2px', opacity: '0.5' }}>
                      {song.play_count.toLocaleString()} plays
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Artists Section */}
        <section>
          <div className="section-header">
            <div className="section-title-wrapper">
              <span className="content-title">Popular artists</span>
              {loading.artists && <div className="loading-spinner"></div>}
              {errors.artists && <span className="error-message">{errors.artists}</span>}
              <div className="pagination-info">
                <span>Page {artistPage} of {totalArtistPages}</span>
                <div className="pagination-dots">
                  {Array.from({ length: totalArtistPages }, (_, i) => (
                    <div 
                      key={i} 
                      className={`dot ${i + 1 === artistPage ? 'active' : ''}`}
                      onClick={() => handleArtistPageChange(i + 1)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="navigation-buttons">
                <button 
                  className="arrow-button"
                  onClick={() => handleArtistPageChange(Math.max(1, artistPage - 1))}
                  disabled={artistPage === 1 || loading.artists}
                  title="Previous"
                >
                  <span>←</span>
                </button>
                <button 
                  className="arrow-button"
                  onClick={() => handleArtistPageChange(Math.min(totalArtistPages, artistPage + 1))}
                  disabled={artistPage === totalArtistPages || loading.artists}
                  title="Next"
                >
                  <span>→</span>
                </button>
              </div>
              <span className="show-all">Show all</span>
            </div>
          </div>
          
          <div className="carousel-container">
            <div className="carousel-slide">
              {artists.map((artist, index) => (
                <div 
                  key={artist.id} 
                  className="song-card artist-card"
                  onClick={() => handleViewArtist(artist)}
                >
                  <div>
                    <img src={artist.avatar_url} alt={artist.name} />
                    <div className="play-button-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                  </div>
                  <h3>{artist.name}</h3>
                  <p>{artist.type}</p>
                  {artist.followers_count && (
                    <p style={{ fontSize: '11px', marginTop: '4px', opacity: '0.7' }}>
                      {formatFollowers(artist.followers_count)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default MainContent;
function setAllTrendingSongs(songs: any) {
  throw new Error('Function not implemented.');
}

function setAllPopularArtists(artists: any) {
  throw new Error('Function not implemented.');
}

