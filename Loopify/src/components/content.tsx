import React, { useState, useEffect } from 'react';
import AddToPlaylistModal from './AddToPlaylistModal';

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
  
  .arrow-icon {
    font-size: 18px;
    font-weight: bold;
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
  
  .carousel-track {
    display: flex;
    gap: 24px;
    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    will-change: transform;
  }

  .carousel-slide {
    min-width: 100%;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    padding: 0 8px;
  }
  
  .slide-animation-left {
    animation: slideFromLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  .slide-animation-right {
    animation: slideFromRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  @keyframes slideFromLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideFromRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .song-card {
    background-color: #181818;
    border-radius: 8px;
    padding: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    opacity: 0;
    animation: fadeIn 0.5s ease forwards;
    min-height: 280px;
    display: flex;
    flex-direction: column;
  }
  
  .song-card:nth-child(1) { animation-delay: 0.05s; }
  .song-card:nth-child(2) { animation-delay: 0.1s; }
  .song-card:nth-child(3) { animation-delay: 0.15s; }
  .song-card:nth-child(4) { animation-delay: 0.2s; }
  .song-card:nth-child(5) { animation-delay: 0.25s; }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .song-card:hover {
    background-color: #282828;
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  
  .card-image-container {
    position: relative;
    flex-shrink: 0;
    margin-bottom: 12px;
  }
  
  .song-card img {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    object-fit: cover;
    display: block;
  }
  
  .song-card h3 {
    font-size: 14px;
    margin: 0 0 4px 0;
    color: #fff;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
    max-height: 2.8em;
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
    z-index: 10;
  }
  
  .song-card:hover .play-button-overlay {
    opacity: 1;
    transform: translateY(0);
  }
  
  .add-to-playlist-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s;
    z-index: 15;
  }
  
  .song-card:hover .add-to-playlist-btn {
    opacity: 1;
  }
  
  .add-to-playlist-btn:hover {
    background: #1db954;
    transform: scale(1.1);
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
  type: string;
  avatar: string;
  followers?: string;
}

interface MainContentProps {
  onSongSelect: (song: Song) => void;
  onArtistSelect: (artist: Artist) => void;
}

const MainContent: React.FC<MainContentProps> = ({ onSongSelect, onArtistSelect }) => {
  const [allTrendingSongs, setAllTrendingSongs] = useState<Song[]>([]);
  const [allPopularArtists, setAllPopularArtists] = useState<Artist[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);
  
  const [songPage, setSongPage] = useState(0);
  const [artistPage, setArtistPage] = useState(0);
  const [songSlideDirection, setSongSlideDirection] = useState<'left' | 'right' | ''>('');
  const [artistSlideDirection, setArtistSlideDirection] = useState<'left' | 'right' | ''>('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setIsLoadingSongs(true);
        const response = await fetch('http://localhost:5001/api/jamendo/tracks?limit=50');
        const data = await response.json();
        
        const tracksWithProxy = data.map((track: Song) => ({
          ...track,
          audioUrl: `http://localhost:5001/api/stream/${track.id}`
        }));
        
        setAllTrendingSongs(tracksWithProxy);
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
      } finally {
        setIsLoadingSongs(false);
      }
    };
    
    fetchTracks();
  }, []);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoadingArtists(true);
        const response = await fetch('http://localhost:5001/api/jamendo/artists?limit=20');
        const data = await response.json();
        setAllPopularArtists(data);
      } catch (error) {
        console.error('Failed to fetch artists:', error);
      } finally {
        setIsLoadingArtists(false);
      }
    };
    
    fetchArtists();
  }, []);

  const totalSongPages = Math.ceil(allTrendingSongs.length / ITEMS_PER_PAGE);
  const totalArtistPages = Math.ceil(allPopularArtists.length / ITEMS_PER_PAGE);
  
  const getCurrentSongs = () => {
    const start = songPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return allTrendingSongs.slice(start, end);
  };
  
  const getCurrentArtists = () => {
    const start = artistPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return allPopularArtists.slice(start, end);
  };
  
  const handleSongPrevious = () => {
    if (songPage > 0 && !isAnimating) {
      setIsAnimating(true);
      setSongSlideDirection('right');
      setTimeout(() => {
        setSongPage(prev => Math.max(0, prev - 1));
        setTimeout(() => {
          setSongSlideDirection('');
          setIsAnimating(false);
        }, 50);
      }, 50);
    }
  };
  
  const handleSongNext = () => {
    if (songPage < totalSongPages - 1 && !isAnimating) {
      setIsAnimating(true);
      setSongSlideDirection('left');
      setTimeout(() => {
        setSongPage(prev => Math.min(totalSongPages - 1, prev + 1));
        setTimeout(() => {
          setSongSlideDirection('');
          setIsAnimating(false);
        }, 50);
      }, 50);
    }
  };
  
  const handleArtistPrevious = () => {
    if (artistPage > 0 && !isAnimating) {
      setIsAnimating(true);
      setArtistSlideDirection('right');
      setTimeout(() => {
        setArtistPage(prev => Math.max(0, prev - 1));
        setTimeout(() => {
          setArtistSlideDirection('');
          setIsAnimating(false);
        }, 50);
      }, 50);
    }
  };
  
  const handleArtistNext = () => {
    if (artistPage < totalArtistPages - 1 && !isAnimating) {
      setIsAnimating(true);
      setArtistSlideDirection('left');
      setTimeout(() => {
        setArtistPage(prev => Math.min(totalArtistPages - 1, prev + 1));
        setTimeout(() => {
          setArtistSlideDirection('');
          setIsAnimating(false);
        }, 50);
      }, 50);
    }
  };
  
  const handleSongPageDirect = (pageIndex: number) => {
    if (pageIndex !== songPage && !isAnimating) {
      setIsAnimating(true);
      setSongSlideDirection(pageIndex < songPage ? 'right' : 'left');
      setTimeout(() => {
        setSongPage(pageIndex);
        setTimeout(() => {
          setSongSlideDirection('');
          setIsAnimating(false);
        }, 50);
      }, 50);
    }
  };
  
  const handleArtistPageDirect = (pageIndex: number) => {
    if (pageIndex !== artistPage && !isAnimating) {
      setIsAnimating(true);
      setArtistSlideDirection(pageIndex < artistPage ? 'right' : 'left');
      setTimeout(() => {
        setArtistPage(pageIndex);
        setTimeout(() => {
          setArtistSlideDirection('');
          setIsAnimating(false);
        }, 50);
      }, 50);
    }
  };
  
  const handlePlaySong = (song: Song) => {
    onSongSelect(song);
  };
  
  const handleViewArtist = (artist: Artist) => {
    onArtistSelect(artist);
  };

  const handleAddToPlaylist = (songId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTrackId(songId);
    setShowAddToPlaylistModal(true);
  };

  if (isLoadingSongs || isLoadingArtists) {
    return (
      <>
        <style>{contentStyles}</style>
        <div className="main-content" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(29, 185, 84, 0.1)',
            borderTop: '4px solid #1db954',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ fontSize: '16px', color: '#b3b3b3' }}>
            Loading music from database...
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <style>{contentStyles}</style>
      <div className="main-content">
        <section style={{ marginBottom: '40px' }}>
          <div className="section-header">
            <div className="section-title-wrapper">
              <span className="content-title">Trending songs</span>
              <div className="pagination-info">
                <span>Page {songPage + 1} of {totalSongPages}</span>
                <div className="pagination-dots">
                  {Array.from({ length: totalSongPages }, (_, i) => (
                    <div 
                      key={i} 
                      className={`dot ${i === songPage ? 'active' : ''}`}
                      onClick={() => handleSongPageDirect(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="navigation-buttons">
                <button 
                  className="arrow-button"
                  onClick={handleSongPrevious}
                  disabled={songPage === 0}
                >
                  <span className="arrow-icon">←</span>
                </button>
                <button 
                  className="arrow-button"
                  onClick={handleSongNext}
                  disabled={songPage === totalSongPages - 1}
                >
                  <span className="arrow-icon">→</span>
                </button>
              </div>
              <span className="show-all">Show all</span>
            </div>
          </div>
          
          <div className="carousel-container">
            <div 
              className={`carousel-track ${songSlideDirection ? `slide-animation-${songSlideDirection}` : ''}`}
              key={`songs-${songPage}`}
            >
              <div className="carousel-slide">
                {getCurrentSongs().map((song, index) => (
                  <div 
                    key={song.id} 
                    className="song-card"
                    onClick={() => handlePlaySong(song)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="card-image-container">
                      <img src={song.cover} alt={song.title} />
                      <button 
                        className="add-to-playlist-btn"
                        onClick={(e) => handleAddToPlaylist(song.id, e)}
                        title="Add to playlist"
                      >
                        +
                      </button>
                      <div className="play-button-overlay">
                        <span className="play-icon">▶</span>
                      </div>
                    </div>
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                    {song.duration && (
                      <p style={{ fontSize: '11px', marginTop: '4px', opacity: '0.7' }}>{song.duration}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-header">
            <div className="section-title-wrapper">
              <span className="content-title">Popular artists</span>
              <div className="pagination-info">
                <span>Page {artistPage + 1} of {totalArtistPages}</span>
                <div className="pagination-dots">
                  {Array.from({ length: totalArtistPages }, (_, i) => (
                    <div 
                      key={i} 
                      className={`dot ${i === artistPage ? 'active' : ''}`}
                      onClick={() => handleArtistPageDirect(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="navigation-buttons">
                <button 
                  className="arrow-button"
                  onClick={handleArtistPrevious}
                  disabled={artistPage === 0}
                >
                  <span className="arrow-icon">←</span>
                </button>
                <button 
                  className="arrow-button"
                  onClick={handleArtistNext}
                  disabled={artistPage === totalArtistPages - 1}
                >
                  <span className="arrow-icon">→</span>
                </button>
              </div>
              <span className="show-all">Show all</span>
            </div>
          </div>
          
          <div className="carousel-container">
            <div 
              className={`carousel-track ${artistSlideDirection ? `slide-animation-${artistSlideDirection}` : ''}`}
              key={`artists-${artistPage}`}
            >
              <div className="carousel-slide">
                {getCurrentArtists().map((artist, index) => (
                  <div 
                    key={artist.id} 
                    className="song-card artist-card"
                    onClick={() => handleViewArtist(artist)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="card-image-container">
                      <img src={artist.avatar} alt={artist.name} />
                      <div className="play-button-overlay">
                        <span className="play-icon">▶</span>
                      </div>
                    </div>
                    <h3>{artist.name}</h3>
                    <p>{artist.type}</p>
                    {artist.followers && (
                      <p style={{ fontSize: '11px', marginTop: '4px', opacity: '0.7' }}>{artist.followers}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {showAddToPlaylistModal && selectedTrackId && (
        <AddToPlaylistModal
          trackId={selectedTrackId}
          onClose={() => setShowAddToPlaylistModal(false)}
        />
      )}
    </>
  );
};

export default MainContent;