import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

interface AddToPlaylistModalProps {
  trackId: number;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ trackId, onClose }) => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/playlists/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPlaylists(data.filter((p: any) => p.role !== 'Viewer'));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackId })
      });

      if (response.ok) {
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('playlistTrackAdded', {
          detail: { playlistId }
        }));
        alert('Track added to playlist!');
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add track');
      }
    } catch (error) {
      console.error('Failed to add track:', error);
      alert('Failed to add track');
    }
  };

  return (
    <>
      <style>{modalStyles}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Add to Playlist</h2>
          {loading ? (
            <p>Loading playlists...</p>
          ) : playlists.length > 0 ? (
            <div className="playlist-list">
              {playlists.map(playlist => (
                  <div 
                    key={playlist.playlistId}  // ✅ Correct!
                    className="playlist-option"
                    onClick={() => handleAddToPlaylist(playlist.playlistId)}  // ✅ Correct!
                  >
                    <span>{playlist.title}</span>
                    <span className="track-count">{playlist.trackCount} songs</span>
                  </div>
                ))}
            </div>
          ) : (
            <p>No playlists available. Create one first!</p>
          )}
          <button className="close-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </>
  );
};

const modalStyles = `
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
  }
  .playlist-list {
    max-height: 400px;
    overflow-y: auto;
  }
  .playlist-option {
    padding: 15px;
    background: #181818;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
  }
  .playlist-option:hover {
    background: #282828;
  }
  .track-count {
    color: #b3b3b3;
    font-size: 12px;
  }
  .close-btn {
    width: 100%;
    padding: 12px;
    margin-top: 20px;
    background: transparent;
    border: 1px solid white;
    color: white;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
  }
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export default AddToPlaylistModal;