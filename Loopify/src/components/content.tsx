import React, { useState } from 'react';

// --- STYLES for this component ---
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
  
  .card-image-container {
    position: relative;
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

// --- INTERFACES ---
interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration?: string;
  album?: string;
}

interface Artist {
  id: number;
  name: string;
  type: string;
  avatar: string;
  followers?: string;
}

// Add props interface for MainContent
interface MainContentProps {
  onSongSelect: (song: Song) => void;
}

// Sample data
const allTrendingSongs: Song[] = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://picsum.photos/200?random=1', duration: '3:20', album: 'After Hours' },
  { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', cover: 'https://picsum.photos/200?random=2', duration: '3:53', album: '÷ (Divide)' },
  { id: 3, title: 'Someone You Loved', artist: 'Lewis Capaldi', cover: 'https://picsum.photos/200?random=3', duration: '3:02', album: 'Divinely Uninspired to a Hellish Extent' },
  { id: 4, title: 'Dance Monkey', artist: 'Tones and I', cover: 'https://picsum.photos/200?random=4', duration: '3:29', album: 'The Kids Are Coming' },
  { id: 5, title: 'Rockstar', artist: 'Post Malone ft. 21 Savage', cover: 'https://picsum.photos/200?random=5', duration: '3:38', album: 'Beerbongs & Bentleys' },
  { id: 6, title: 'One Dance', artist: 'Drake', cover: 'https://picsum.photos/200?random=6', duration: '2:54', album: 'Views' },
  { id: 7, title: 'Closer', artist: 'The Chainsmokers', cover: 'https://picsum.photos/200?random=7', duration: '4:04', album: 'Collage' },
  { id: 8, title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', cover: 'https://picsum.photos/200?random=8', duration: '2:21', album: 'F*ck Love 3' },
  { id: 9, title: 'Believer', artist: 'Imagine Dragons', cover: 'https://picsum.photos/200?random=9', duration: '3:24', album: 'Evolve' },
  { id: 10, title: 'Perfect', artist: 'Ed Sheeran', cover: 'https://picsum.photos/200?random=10', duration: '4:23', album: '÷ (Divide)' },
  { id: 11, title: 'Bad Guy', artist: 'Billie Eilish', cover: 'https://picsum.photos/200?random=11', duration: '3:14', album: 'When We All Fall Asleep, Where Do We Go?' },
  { id: 12, title: 'Señorita', artist: 'Shawn Mendes & Camila Cabello', cover: 'https://picsum.photos/200?random=12', duration: '3:11', album: 'Shawn Mendes' },
  { id: 13, title: 'Memories', artist: 'Maroon 5', cover: 'https://picsum.photos/200?random=13', duration: '3:09', album: 'Memories' },
  { id: 14, title: 'Lucid Dreams', artist: 'Juice WRLD', cover: 'https://picsum.photos/200?random=14', duration: '3:59', album: 'Goodbye & Good Riddance' },
  { id: 15, title: 'Old Town Road', artist: 'Lil Nas X', cover: 'https://picsum.photos/200?random=15', duration: '2:37', album: '7 EP' },
  { id: 16, title: 'Sunflower', artist: 'Post Malone & Swae Lee', cover: 'https://picsum.photos/200?random=16', duration: '2:38', album: 'Spider-Man: Into the Spider-Verse' },
  { id: 17, title: 'Without Me', artist: 'The Weeknd', cover: 'https://picsum.photos/200?random=17', duration: '3:20', album: 'My Dear Melancholy,' },
  { id: 18, title: 'Happier', artist: 'Marshmello ft. Bastille', cover: 'https://picsum.photos/200?random=18', duration: '3:34', album: 'Happier' },
  { id: 19, title: 'Thunder', artist: 'Imagine Dragons', cover: 'https://picsum.photos/200?random=19', duration: '3:07', album: 'Evolve' },
  { id: 20, title: 'Havana', artist: 'Camila Cabello ft. Young Thug', cover: 'https://picsum.photos/200?random=20', duration: '3:37', album: 'Camila' },
  { id: 21, title: 'Circles', artist: 'Post Malone', cover: 'https://picsum.photos/200?random=21', duration: '3:35', album: 'Hollywood\'s Bleeding' },
];

const allPopularArtists: Artist[] = [
  { id: 1, name: 'Taylor Swift', type: 'Artist', avatar: 'https://picsum.photos/200?random=101', followers: '92M followers' },
  { id: 2, name: 'Drake', type: 'Artist', avatar: 'https://picsum.photos/200?random=102', followers: '78M followers' },
  { id: 3, name: 'Bad Bunny', type: 'Artist', avatar: 'https://picsum.photos/200?random=103', followers: '67M followers' },
  { id: 4, name: 'The Weeknd', type: 'Artist', avatar: 'https://picsum.photos/200?random=104', followers: '95M followers' },
  { id: 5, name: 'Ariana Grande', type: 'Artist', avatar: 'https://picsum.photos/200?random=105', followers: '85M followers' },
  { id: 6, name: 'Ed Sheeran', type: 'Artist', avatar: 'https://picsum.photos/200?random=106', followers: '88M followers' },
  { id: 7, name: 'Billie Eilish', type: 'Artist', avatar: 'https://picsum.photos/200?random=107', followers: '71M followers' },
  { id: 8, name: 'Justin Bieber', type: 'Artist', avatar: 'https://picsum.photos/200?random=108', followers: '72M followers' },
  { id: 9, name: 'Eminem', type: 'Artist', avatar: 'https://picsum.photos/200?random=109', followers: '65M followers' },
  { id: 10, name: 'Rihanna', type: 'Artist', avatar: 'https://picsum.photos/200?random=110', followers: '61M followers' },
  { id: 11, name: 'Post Malone', type: 'Artist', avatar: 'https://picsum.photos/200?random=111', followers: '58M followers' },
  { id: 12, name: 'Dua Lipa', type: 'Artist', avatar: 'https://picsum.photos/200?random=112', followers: '55M followers' },
  { id: 13, name: 'Olivia Rodrigo', type: 'Artist', avatar: 'https://picsum.photos/200?random=113', followers: '42M followers' },
  { id: 14, name: 'BTS', type: 'Group', avatar: 'https://picsum.photos/200?random=114', followers: '73M followers' },
];

// Update component to accept props
const MainContent: React.FC<MainContentProps> = ({ onSongSelect }) => {
  // State for pagination
  const [songPage, setSongPage] = useState(0);
  const [artistPage, setArtistPage] = useState(0);
  const [songSlideDirection, setSongSlideDirection] = useState<'left' | 'right' | ''>('');
  const [artistSlideDirection, setArtistSlideDirection] = useState<'left' | 'right' | ''>('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Configuration
  const ITEMS_PER_PAGE = 5;
  
  // Calculate total pages
  const totalSongPages = Math.ceil(allTrendingSongs.length / ITEMS_PER_PAGE);
  const totalArtistPages = Math.ceil(allPopularArtists.length / ITEMS_PER_PAGE);
  
  // Get current visible items
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
  
  // Navigation handlers with animation
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
  
  // Direct page navigation (clicking dots)
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
  
  // Updated play song handler - now calls onSongSelect
  const handlePlaySong = (song: Song) => {
    console.log('Playing:', song.title, 'by', song.artist);
    // Call the onSongSelect prop function to open the player
    onSongSelect(song);
  };
  
  // View artist handler
  const handleViewArtist = (artist: Artist) => {
    console.log('Viewing artist:', artist.name);
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
              <div className="pagination-info">
                <span>Page {songPage + 1} of {totalSongPages}</span>
                <div className="pagination-dots">
                  {Array.from({ length: totalSongPages }, (_, i) => (
                    <div 
                      key={i} 
                      className={`dot ${i === songPage ? 'active' : ''}`}
                      onClick={() => handleSongPageDirect(i)}
                      style={{ cursor: 'pointer' }}
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
                  title="Previous"
                >
                  <span className="arrow-icon">←</span>
                </button>
                <button 
                  className="arrow-button"
                  onClick={handleSongNext}
                  disabled={songPage === totalSongPages - 1}
                  title="Next"
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

        {/* Popular Artists Section */}
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
                      style={{ cursor: 'pointer' }}
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
                  title="Previous"
                >
                  <span className="arrow-icon">←</span>
                </button>
                <button 
                  className="arrow-button"
                  onClick={handleArtistNext}
                  disabled={artistPage === totalArtistPages - 1}
                  title="Next"
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
    </>
  );
};

export default MainContent;