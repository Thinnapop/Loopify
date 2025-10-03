import React, { useState, useEffect, useRef } from 'react';

// Props interface
interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration?: string;
  album?: string;
  audioUrl?: string;
}

interface PlayTheSongProps {
  song: Song;
  onClose: () => void;
}

const PlayTheSong: React.FC<PlayTheSongProps> = ({ song, onClose }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isLiked, setIsLiked] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCorsMessage, setShowCorsMessage] = useState(false);
  const [useSimulation, setUseSimulation] = useState(false);

  // Parse duration string to seconds
  const parseDuration = (durationStr?: string): number => {
    if (!durationStr) return 180;
    const [mins, secs] = durationStr.split(':').map(Number);
    return (mins * 60) + (secs || 0);
  };

  // Initialize audio element
  useEffect(() => {
    if (song.audioUrl) {
      audioRef.current = new Audio(song.audioUrl);
      audioRef.current.volume = volume / 100;
      
      const handleError = () => {
        console.log('CORS blocked - using simulated playback for demo');
        setShowCorsMessage(true);
        setUseSimulation(true);
        setDuration(parseDuration(song.duration));
        setIsLoading(false);
      };
      
      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
          setIsLoading(false);
          setUseSimulation(false);
        }
      };
      
      const handleTimeUpdate = () => {
        if (audioRef.current && !useSimulation) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      const handleEnded = () => {
        if (repeat && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };
      
      audioRef.current.addEventListener('error', handleError);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
      
      // Trigger error immediately since we know it will fail
      setTimeout(handleError, 500);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('error', handleError);
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current = null;
        }
      };
    }
  }, [song.audioUrl, repeat, song.duration]);

  // Simulated playback timer
  useEffect(() => {
    if (!isPlaying || !useSimulation) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) {
          if (repeat) {
            return 0;
          } else {
            setIsPlaying(false);
            return duration;
          }
        }
        return prev + 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, duration, repeat, useSimulation]);

  // Handle play/pause
  const togglePlay = () => {
    if (isLoading) return;
    
    if (useSimulation) {
      setIsPlaying(!isPlaying);
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {
          setUseSimulation(true);
          setIsPlaying(true);
        });
        setIsPlaying(true);
      }
    }
  };

  // Handle progress change
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (Number(e.target.value) / 100) * duration;
    setCurrentTime(newTime);
    if (audioRef.current && !useSimulation) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <style>{playerStyles}</style>
      <div className="player-container">
        <div 
          className="player-background"
          style={{ backgroundImage: `url(${song.cover})` }}
        />
        
        <div className="player-content">
          <div className="player-header">
            <button className="close-button" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <span className="now-playing">NOW PLAYING</span>
            <button className="menu-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
          
          <div className="player-main">
            <div className="player-center">
              <div className="album-art-container">
                <img 
                  src={song.cover} 
                  alt={song.title}
                  className={`album-art ${isPlaying ? 'spinning' : ''}`}
                />
                <div className="vinyl-hole"></div>
              </div>
              
              <div className="song-info">
                <h1 className="song-title">{song.title}</h1>
                <p className="song-artist">{song.artist}</p>
                <p className="song-meta">{song.album || 'Single'}</p>
                {showCorsMessage && (
                  <p className="demo-mode-text">Demo Mode - Simulated Playback</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="progress-section">
            <span className="time-label">{formatTime(currentTime)}</span>
            <input 
              type="range"
              className="progress-bar"
              min="0"
              max="100"
              value={duration > 0 ? (currentTime / duration) * 100 : 0}
              onChange={handleProgressChange}
              disabled={isLoading}
            />
            <span className="time-label">{formatTime(duration)}</span>
          </div>
          
          <div className="controls-section">
            <div className="controls-left">
              <button 
                className={`control-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? '#1db954' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
            
            <div className="controls-center">
              <button 
                className={`control-btn ${shuffle ? 'active' : ''}`}
                onClick={() => setShuffle(!shuffle)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                </svg>
              </button>
              
              <button className="control-btn" disabled={isLoading}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>
              
              <button className="play-btn" onClick={togglePlay} disabled={isLoading}>
                {isPlaying ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              
              <button className="control-btn" disabled={isLoading}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>
              
              <button 
                className={`control-btn ${repeat ? 'active' : ''}`}
                onClick={() => setRepeat(!repeat)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                </svg>
              </button>
            </div>
            
            <div className="controls-right">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <input 
                type="range"
                className="volume-slider"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const playerStyles = `
  .player-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #121212;
    z-index: 3000;
    display: flex;
    flex-direction: column;
  }
    .demo-mode-text {
    font-size: 13px;
    color: #ff9800;
    margin-top: 8px;
    font-weight: 500;
  }
  
  .player-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    filter: blur(50px);
    opacity: 0.3;
  }
  
  .player-content {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    padding: 20px;
  }
  
  .player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .close-button,
  .menu-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  
  .close-button:hover,
  .menu-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .now-playing {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 2px;
    color: #b3b3b3;
  }
  
  .player-main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  
  .player-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    max-width: 600px;
    width: 100%;
  }
  
  .album-art-container {
    position: relative;
    width: 400px;
    height: 400px;
  }
  
  .album-art {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    object-fit: cover;
  }
  
  .album-art.spinning {
    animation: spin 20s linear infinite;
    border-radius: 50%;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .vinyl-hole {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: #121212;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .album-art.spinning + .vinyl-hole {
    opacity: 0.8;
  }
  
  .song-info {
    text-align: center;
    width: 100%;
  }
  
  .song-title {
    font-size: 32px;
    font-weight: 700;
    color: white;
    margin: 0 0 12px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .song-artist {
    font-size: 22px;
    color: #b3b3b3;
    margin: 0 0 8px 0;
  }
  
  .song-meta {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
  
  .loading-text {
    font-size: 14px;
    color: #1db954;
    margin-top: 8px;
  }
  
  .progress-section {
    display: flex;
    align-items: center;
    gap: 15px;
    margin: 30px 0 20px;
  }
  
  .time-label {
    color: #b3b3b3;
    font-size: 12px;
    min-width: 40px;
    text-align: center;
  }
  
  .progress-bar {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }
  
  .progress-bar:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  .progress-bar::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .progress-bar::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  
  .controls-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .controls-left,
  .controls-right {
    flex: 1;
    display: flex;
    align-items: center;
  }
  
  .controls-right {
    justify-content: flex-end;
    gap: 10px;
  }
  
  .controls-center {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .control-btn {
    background: none;
    border: none;
    color: #b3b3b3;
    cursor: pointer;
    padding: 8px;
    transition: all 0.2s;
  }
  
  .control-btn:hover:not(:disabled) {
    color: white;
  }
  
  .control-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .control-btn.active {
    color: #1db954;
  }
  
  .control-btn.liked {
    color: #1db954;
  }
  
  .play-btn {
    width: 56px;
    height: 56px;
    background: white;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: black;
  }
  
  .play-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }
  
  .play-btn:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  .play-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .volume-slider {
    width: 100px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }
  
  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    .album-art-container {
      width: 280px;
      height: 280px;
    }
    
    .song-title {
      font-size: 24px;
    }
    
    .song-artist {
      font-size: 18px;
    }
    
    .controls-center {
      gap: 12px;
    }
  }
`;

export default PlayTheSong;