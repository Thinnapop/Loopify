import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

interface SidebarProps {
  currentUser: any;
  onPlaylistClick: (playlistId: number) => void;
}

const sidebarStyles = `
  .sidebar-container {
    display: flex;
    flex-direction: column;
    width: 350px;
    height: 100%;
    background-color: #1A1818;
    color: #b3b3b3;
    font-family: sans-serif;
    border-radius: 15px;
  }
  .library-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    font-size: 16px;
    font-weight: bold;
  }
  .library-header .plus-icon {
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  .library-header .plus-icon:hover {
    background-color: #1a1a1a;
    color: #fff;
  }
  .content-section {
    background-color: #121212;
    border-radius: 8px;
    padding: 20px;
    margin: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .content-section h2 {
    color: #fff;
    font-size: 16px;
    margin: 0 0 4px 0;
  }
  .content-section p {
    font-size: 14px;
    margin: 0 0 16px 0;
  }
  .action-button {
    background-color: #fff;
    color: #000;
    border: none;
    border-radius: 50px;
    padding: 8px 16px;
    font-weight: bold;
    cursor: pointer;
    align-self: flex-start;
    transition: transform 0.1s ease;
  }
  .action-button:hover {
    transform: scale(1.05);
  }
  .playlists-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px;
  }
  .playlist-item {
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .playlist-item:hover {
    background-color: #282828;
  }
  .playlist-title {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .playlist-meta {
    color: #b3b3b3;
    font-size: 12px;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  .modal-content {
    background: #282828;
    padding: 30px;
    border-radius: 12px;
    width: 400px;
    max-width: 90%;
  }
  .modal-content h2 {
    color: white;
    margin: 0 0 20px 0;
    font-size: 20px;
  }
  .modal-input {
    width: 100%;
    padding: 12px;
    background: #121212;
    border: 1px solid #555;
    border-radius: 4px;
    color: white;
    font-size: 16px;
    margin-bottom: 20px;
  }
  .modal-input:focus {
    outline: none;
    border-color: #1db954;
  }
  .modal-buttons {
    display: flex;
    gap: 10px;
  }
  .modal-button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 20px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }
  .modal-button-primary {
    background: #1db954;
    color: white;
  }
  .modal-button-primary:hover {
    background: #1ed760;
    transform: scale(1.02);
  }
  .modal-button-secondary {
    background: transparent;
    color: white;
    border: 1px solid white;
  }
  .modal-button-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .sidebar-footer {
    padding: 16px;
    margin-top: auto;
  }
  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
  }
  .footer-links a {
    color: #b3b3b3;
    text-decoration: none;
    font-size: 12px;
  }
  .footer-links a:hover {
    text-decoration: underline;
  }
  .language-button {
    background-color: transparent;
    border: 1px solid #727272;
    color: #fff;
    border-radius: 50px;
    padding: 6px 12px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .language-button:hover {
    border-color: #fff;
    transform: scale(1.05);
  }
`;

const Sidebar: React.FC<SidebarProps> = ({ currentUser,onPlaylistClick }) => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchPlaylists();
    }
  }, [currentUser]);

  useEffect(() => {
    const handlePlaylistTrackAdded = () => {
      console.log('Refreshing sidebar playlists after track added');
      fetchPlaylists();
    };

    window.addEventListener('playlistTrackAdded', handlePlaylistTrackAdded);

    return () => {
      window.removeEventListener('playlistTrackAdded', handlePlaylistTrackAdded);
    };
  }, []);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/playlists/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Fetch playlists failed:', response.status, errorData);
        return;
      }

      const data = await response.json();
      console.log('Fetched playlists:', data.length);
      setPlaylists(data);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/playlists/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPlaylistTitle,
          visibility: 'private'
        })
      });

      if (response.ok) {
        setNewPlaylistTitle('');
        setShowCreateModal(false);
        fetchPlaylists();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Create playlist failed:', response.status, errorData);
        alert(`Failed to create playlist: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create playlist:', error);
      alert('Failed to create playlist');
    }
  };

  const handlePlaylistClick = (playlistId: number) => {
    onPlaylistClick(playlistId);
  };

  return (
    <>
      <style>{sidebarStyles}</style>
      <div className="sidebar-container">
        
        <div className="library-header">
          <span>Your Library</span>
          <div className="plus-icon" onClick={() => currentUser ? setShowCreateModal(true) : alert('Please login to create playlists')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 7H9V2H7V7H2V9H7V14H9V9H14V7Z"></path>
            </svg>
          </div>
        </div>

        {currentUser ? (
          playlists.length > 0 ? (
            <div className="playlists-container">
              {playlists.map(playlist => (
                <div key={playlist.playlistId} className="playlist-item" onClick={() => handlePlaylistClick(playlist.playlistId)}>
                  <div className="playlist-title">{playlist.title}</div>
                  <div className="playlist-meta">
                    Playlist • {playlist.trackCount} songs
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="content-section">
              <h2>Create your first playlist</h2>
              <p>It's easy, we'll help you</p>
              <button className="action-button" onClick={() => setShowCreateModal(true)}>
                Create playlist
              </button>
            </div>
          )
        ) : (
          <div className="content-section">
            <h2>Create your first playlist</h2>
            <p>Login to start creating playlists</p>
          </div>
        )}

        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create Playlist</h2>
              <input
                type="text"
                className="modal-input"
                placeholder="My Playlist #1"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                autoFocus
              />
              <div className="modal-buttons">
                <button className="modal-button modal-button-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button className="modal-button modal-button-primary" onClick={handleCreatePlaylist}>
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="sidebar-footer">
          <div className="footer-links">
            <a href="#">Legal</a>
            <a href="#">Safety & Privacy Center</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookies</a>
            <a href="#">About Ads</a>
            <a href="#">Accessibility</a>
          </div>
          <button className="language-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"></path>
            </svg>
            English
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;