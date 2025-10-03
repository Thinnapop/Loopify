import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './page/Login';
import RegistPage from './page/Regist';
import ProfilePage from './page/Profile';
import ArtistPage from './page/Artist';
import Sidebar from './components/SideBar';
import MainContent from './components/content';
import PlayTheSong from './page/playTheSong';
import PlaylistDetail from './page/PlaylistDetail';
import JoinPlaylistPage from './page/JoinPlaylist';

interface UserData {
  userId?: string;
  displayName: string;
  email?: string;
  country?: string;
  sex?: string;
  language?: string;
}

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

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [currentPlayingSong, setCurrentPlayingSong] = useState<Song | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Check for saved user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('loopifyUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch {
        setCurrentUser({ displayName: savedUser });
      }
    }
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/invite/')) {
      const code = path.split('/invite/')[1];
      setInviteCode(code);
      setCurrentPage('join-playlist');
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = (userData: UserData) => {
    setCurrentUser(userData);
    localStorage.setItem('loopifyUser', JSON.stringify(userData));
    setShowWelcomeMessage(true);
    setCurrentPage('home');
    
    setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 3000);
  };
  const handlePlaylistClick = (playlistId: number) => {
    console.log('Clicked playlist ID:', playlistId); // Add this
    setSelectedPlaylist(playlistId);
    setCurrentPage('playlist');
  };
  // Handle logout with loading animation
  const handleLogout = () => {
    setIsLoggingOut(true);
    
    setTimeout(() => {
      setCurrentUser(null);
      localStorage.removeItem('loopifyUser');
      localStorage.removeItem('authToken');
      setIsLoggingOut(false);
      setShowLogoutMessage(true);
      
      setTimeout(() => {
        setShowLogoutMessage(false);
        setCurrentPage('home');
      }, 2000);
    }, 2000);
  };

  // Handle registration success
  const handleRegistrationSuccess = (userData?: UserData) => {
    if (userData) {
      setCurrentUser(userData);
      localStorage.setItem('loopifyUser', JSON.stringify(userData));
      setShowWelcomeMessage(true);
      setCurrentPage('home');
      
      setTimeout(() => {
        setShowWelcomeMessage(false);
      }, 3000);
    } else {
      setCurrentPage('login');
    }
  };

  // Handle navigation to profile with loading
  const handleProfileClick = () => {
    setIsLoadingProfile(true);
    
    setTimeout(() => {
      setIsLoadingProfile(false);
      setCurrentPage('profile');
    }, 1000);
  };

  // Update user data
  const updateUserData = (updatedUser: UserData) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('loopifyUser', JSON.stringify(updatedUser));
  };

  // Handle song selection
  const handleSongSelect = (song: Song) => {
    setCurrentPlayingSong(song);
  };

  // Handle artist selection
  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    setCurrentPage('artist');
  };

  // Handle closing the player
  const handleClosePlayer = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentPlayingSong(null);
      setIsTransitioning(false);
    }, 200);
  };

  // All styles
  const appStyles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    .player-enter {
      animation: simpleFadeIn 0.2s ease-out;
    }
    
    .player-exit {
      animation: simpleFadeOut 0.2s ease-out forwards;
    }
    
    @keyframes simpleFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes simpleFadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    
    .welcome-message {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
    }
    
    .logout-success-message {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(238, 90, 36, 0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
    }
    
    .logout-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease-out;
    }
    
    .logout-modal {
      background: #282828;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      animation: scaleIn 0.3s ease-out;
    }
    
    .logout-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top-color: #1db954;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .logout-text {
      font-size: 18px;
      font-weight: 600;
      color: white;
    }
    
    .profile-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease-out;
    }
    
    .profile-loading-modal {
      background: #282828;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      animation: scaleIn 0.3s ease-out;
    }
    
    .profile-loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .profile-loading-text {
      font-size: 18px;
      font-weight: 600;
      color: white;
    }
    
    .message-icon {
      font-size: 24px;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes scaleIn {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;
  
  const mainAppLayout = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000' }}>
      <style>{appStyles}</style>
      
      {showWelcomeMessage && currentUser && (
        <div className="welcome-message">
          <span className="message-icon">🎵</span>
          <span>Welcome back, {currentUser.displayName}!</span>
        </div>
      )}
      
      {showLogoutMessage && !isLoggingOut && (
        <div className="logout-success-message">
          <span className="message-icon">👋</span>
          <span>Logout successful! See you soon!</span>
        </div>
      )}
      
      {isLoggingOut && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <div className="logout-spinner"></div>
            <div className="logout-text">Logging out...</div>
          </div>
        </div>
      )}
      
      {isLoadingProfile && (
        <div className="profile-loading-overlay">
          <div className="profile-loading-modal">
            <div className="profile-loading-spinner"></div>
            <div className="profile-loading-text">Loading your profile...</div>
          </div>
        </div>
      )}
      
      <Navbar 
        onLoginClick={() => setCurrentPage('login')}
        onRegisterClick={() => setCurrentPage('register')}
        currentUser={currentUser}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        onProfileClick={handleProfileClick}
        isLoadingProfile={isLoadingProfile}
      />
      <div style={{ display: 'flex', flex: 1 }}>
      <Sidebar 
        currentUser={currentUser}
        onPlaylistClick={handlePlaylistClick}
      />
        <MainContent 
          onSongSelect={handleSongSelect}
          onArtistSelect={handleArtistSelect}
        />
      </div>
      
      {currentPlayingSong && (
        <div className={`${isTransitioning ? 'player-exit' : 'player-enter'}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000 }}>
          <PlayTheSong 
            song={currentPlayingSong}
            onClose={handleClosePlayer}
          />
        </div>
      )}
    </div>
  );

  // Render pages based on currentPage state
  switch (currentPage) {
    case 'login':
      return (
        <LoginPage
          onBackClick={() => setCurrentPage('home')}
          onLoginSuccess={handleLoginSuccess}
          onRegisterClick={() => setCurrentPage('register')}
        />
      );
    case 'register':
      return (
        <RegistPage 
          onBackClick={() => setCurrentPage('home')}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      );
    case 'profile':
      return (
        <ProfilePage
          currentUser={currentUser}
          onBackClick={() => setCurrentPage('home')}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          onUpdateUser={updateUserData}
        />
      );
      case 'join-playlist':
  return inviteCode ? (
    <JoinPlaylistPage
      inviteCode={inviteCode}
      onBackClick={() => {
        setCurrentPage('home');
        window.history.pushState({}, '', '/');
      }}
      currentUser={currentUser}
    />
  ) : mainAppLayout;
      case 'playlist':
  return selectedPlaylist ? (
    <PlaylistDetail
      playlistId={selectedPlaylist}
      onBackClick={() => setCurrentPage('home')}
      onSongSelect={handleSongSelect}
    />
  ) : mainAppLayout;
    case 'artist':
      return selectedArtist ? (
        <ArtistPage
          artist={selectedArtist}
          onBackClick={() => setCurrentPage('home')}
          onSongSelect={handleSongSelect}
        />
      ) : (
        mainAppLayout
      );
      
    default:
      return mainAppLayout;
  }
}

export default App;