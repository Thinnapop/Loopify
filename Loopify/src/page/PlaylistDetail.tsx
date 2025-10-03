import React, { useState, useEffect } from 'react';

interface PlaylistDetailProps {
  playlistId: number;
  onBackClick: () => void;
  onSongSelect: (song: any) => void;
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlistId, onBackClick, onSongSelect }) => {
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVisibility, setEditVisibility] = useState('Private');
  
  const [showShareModal, setShowShareModal] = useState(false);
const [inviteCode, setInviteCode] = useState('');
const [showMembersModal, setShowMembersModal] = useState(false);
const [members, setMembers] = useState<any[]>([]);
const [inviteRole, setInviteRole] = useState<'Editor' | 'Viewer'>('Viewer');

const handleGenerateInvite = async () => {
    console.log(`Invite code generated for playlist ${playlistId} with role ${inviteRole}`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/playlists/${playlistId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: inviteRole }) // Use selected role
      });
  
      if (response.ok) {
        const data = await response.json();
        setInviteCode(data.inviteUrl);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate invite');
      }
    } catch (error) {
      console.error('Failed to generate invite:', error);
      alert('Failed to generate invite');
    }
  };

const handleCopyInvite = () => {
  navigator.clipboard.writeText(inviteCode);
  alert('Invite link copied to clipboard!');
};

const fetchMembers = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:5001/api/playlists/${playlistId}/members`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setMembers(data);
  } catch (error) {
    console.error('Failed to fetch members:', error);
  }
};

const handleRemoveMember = async (userId: number) => {
  if (!confirm('Remove this member from the playlist?')) return;

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `http://localhost:5001/api/playlists/${playlistId}/members/${userId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (response.ok) {
      fetchMembers();
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to remove member');
    }
  } catch (error) {
    console.error('Failed to remove member:', error);
    alert('Failed to remove member');
  }
};
  useEffect(() => {
    fetchPlaylistDetails();
  }, [playlistId]);

  const fetchPlaylistDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/playlists/${playlistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPlaylist(data);
      setTracks(data.tracks || []);
      setEditTitle(data.title);
      setEditDescription(data.description || '');
      setEditVisibility(data.visibility);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      setLoading(false);
    }
  };

  const handleEditPlaylist = async () => {
    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          visibility: editVisibility
        })
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchPlaylistDetails();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update playlist');
      }
    } catch (error) {
      console.error('Failed to update playlist:', error);
      alert('Failed to update playlist');
    }
  };

  const handleDeleteTrack = async (trackId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Remove this song from playlist?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:5001/api/playlists/${playlistId}/tracks/${trackId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setTracks(tracks.filter(t => t.id !== trackId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove track');
      }
    } catch (error) {
      console.error('Failed to remove track:', error);
      alert('Failed to remove track');
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Playlist deleted!');
        onBackClick();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete playlist');
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      alert('Failed to delete playlist');
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <>
      <style>{playlistStyles}</style>
      <div className="playlist-page">
        <div className="playlist-header">
          <button className="back-btn" onClick={onBackClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back
          </button>
          
          <div className="playlist-info">
            <h1>{playlist?.title}</h1>
            <p>{playlist?.description || 'No description'}</p>
            <p className="playlist-meta">
              {tracks.length} songs • {playlist?.visibility}
            </p>
            
            <div className="action-buttons">
            {(playlist?.role === 'Owner' || playlist?.role === 'Editor') && (
                <>
                <button 
                    className="edit-playlist-btn"
                    onClick={() => setShowEditModal(true)}
                >
                    Edit Details
                </button>
                <button 
                    className="share-playlist-btn"
                    onClick={() => {
                    setShowShareModal(true);
                    handleGenerateInvite();
                    }}
                >
                    Share
                </button>
                </>
            )}
            <button 
                className="members-btn"
                onClick={() => {
                setShowMembersModal(true);
                fetchMembers();
                }}>
                Members ({members.length || 0})
            </button>
            
            {playlist?.role === 'Owner' && (
                <button 
                className="delete-playlist-btn"
                onClick={() => setShowDeleteConfirm(true)}
                >
                Delete Playlist
                </button>
            )}
            </div>
          </div>
        </div>

        <div className="playlist-content">
          <h2>Tracks</h2>
          {tracks.length > 0 ? (
            <div className="tracks-list">
              {tracks.map((track, index) => (
                <div key={track.id} className="track-item" onClick={() => onSongSelect(track)}>
                  <span className="track-number">{index + 1}</span>
                  <img src={track.cover} alt={track.title} />
                  <div className="track-info">
                    <div className="track-title">{track.title}</div>
                    <div className="track-artist">{track.artist}</div>
                  </div>
                  <span className="track-duration">{track.duration}</span>
                  {(playlist?.role === 'Owner' || playlist?.role === 'Editor') && (
                    <button 
                      className="delete-track-btn"
                      onClick={(e) => handleDeleteTrack(track.id, e)}
                      title="Remove from playlist"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-playlist">
              <p>No songs yet. Start adding tracks!</p>
            </div>
          )}
        </div>
      </div>
      {showShareModal && (
  <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
    <div className="share-modal" onClick={(e) => e.stopPropagation()}>
      <h2>Share Playlist</h2>
      <p>Choose the role for invited users</p>
      
      <div className="role-selector">
        <label>
        <input
            type="radio"
            value="Viewer"
            checked={inviteRole === 'Viewer'}
            onChange={(e) => {
                setInviteRole('Viewer');
                setInviteCode('');  
            }}
        />
          <span className="role-option">
            <strong>Viewer</strong>
            <span className="role-desc">Can only view and play songs</span>
          </span>
        </label>
        
        <label>
        <input
            type="radio"
            value="Editor"
            checked={inviteRole === 'Editor'}
            onChange={(e) => {
                setInviteRole('Editor');
                setInviteCode('');  // Add this
            }}
        />
          <span className="role-option">
            <strong>Editor</strong>
            <span className="role-desc">Can add and remove songs</span>
          </span>
        </label>
      </div>

      {inviteCode && (
        <>
          <p style={{ marginTop: '20px', color: '#b3b3b3' }}>
            Share this link with others
          </p>
          <div className="invite-link-container">
            <input
              type="text"
              className="invite-link-input"
              value={inviteCode}
              readOnly
            />
            <button className="copy-btn" onClick={handleCopyInvite}>
              Copy
            </button>
          </div>
        </>
      )}

        {!inviteCode && (
        <button 
            className="generate-btn" 
            onClick={handleGenerateInvite}
        >
            Generate Invite Link
        </button>
        )}
      
      <button className="close-modal-btn" onClick={() => {
        setShowShareModal(false);
        setInviteCode('');
      }}>
        Close
      </button>
    </div>
  </div>
)}

{showMembersModal && (
  <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
    <div className="members-modal" onClick={(e) => e.stopPropagation()}>
      <h2>Playlist Members</h2>
      <div className="members-list">
        {members.map(member => (
          <div key={member.userId} className="member-item">
            <div className="member-info">
              <div className="member-name">{member.displayName}</div>
              <div className="member-role">{member.role}</div>
            </div>
            {playlist?.role === 'Owner' && member.role !== 'Owner' && (
              <button 
                className="remove-member-btn"
                onClick={() => handleRemoveMember(member.userId)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="close-modal-btn" onClick={() => setShowMembersModal(false)}>
        Close
      </button>
    </div>
  </div>
)}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Playlist</h2>
            <input
              type="text"
              className="modal-input"
              placeholder="Playlist title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              className="modal-textarea"
              placeholder="Description (optional)"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
            />
            <select 
              className="modal-select"
              value={editVisibility}
              onChange={(e) => setEditVisibility(e.target.value)}
            >
              <option value="Private">Private</option>
              <option value="Shared">Shared</option>
              <option value="Public">Public</option>
            </select>
            <div className="modal-buttons">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleEditPlaylist}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Playlist?</h2>
            <p>This action cannot be undone.</p>
            <div className="modal-buttons">
              <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="delete-btn" onClick={handleDeletePlaylist}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const playlistStyles = `
  body, html {
    margin: 0;
    padding: 0;
    background-color: #000; 
  }
  .playlist-page {
    min-height: 100vh;
    background: #000;
    color: white;
  }
  .playlist-header {
    background: linear-gradient(180deg, #1a1a1a 0%, #121212 100%);
    padding: 30px 50px;
  }
  .back-btn {
    background: rgba(0,0,0,0.5);
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
  }
  .back-btn:hover {
    background: rgba(0,0,0,0.7);
  }
  .playlist-info h1 {
    font-size: 48px;
    margin: 10px 0;
  }
  .playlist-meta {
    color: #b3b3b3;
    margin-top: 10px;
  }
  .action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }
  .edit-playlist-btn {
    padding: 10px 24px;
    background: #1db954;
    border: none;
    color: white;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
  }
  .edit-playlist-btn:hover {
    background: #1ed760;
  }
  .delete-playlist-btn {
    padding: 10px 24px;
    background: transparent;
    border: 1px solid #ff4444;
    color: #ff4444;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
  }
    .share-playlist-btn, .members-btn {
  padding: 10px 24px;
  background: #3b82f6;
  border: none;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}
.share-playlist-btn:hover, .members-btn:hover {
  background: #2563eb;
}
.share-modal, .members-modal {
  background: #282828;
  padding: 30px;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
}
.share-modal h2, .members-modal h2 {
  margin: 0 0 20px 0;
  color: white;
}
.share-modal p {
  color: #b3b3b3;
  margin-bottom: 20px;
}
.invite-link-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.invite-link-input {
  flex: 1;
  padding: 12px;
  background: #121212;
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
  font-size: 14px;
}
.copy-btn {
  padding: 12px 24px;
  background: #1db954;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.copy-btn:hover {
  background: #1ed760;
}
.close-modal-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid white;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}
.members-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}
.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #181818;
  border-radius: 8px;
  margin-bottom: 8px;
}
.member-name {
  color: white;
  font-weight: 500;
}
.member-role {
  color: #b3b3b3;
  font-size: 12px;
  margin-top: 4px;
}
.remove-member-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #ff4444;
  color: #ff4444;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
}
.remove-member-btn:hover {
  background: #ff4444;
  color: white;
}
  .delete-playlist-btn:hover {
    background: #ff4444;
    color: white;
  }
  .playlist-content {
    padding: 30px 50px;
  }
  .tracks-list {
    margin-top: 20px;
  }
  .track-item {
    display: grid;
    grid-template-columns: 40px 50px 1fr 80px 40px;
    gap: 15px;
    padding: 10px;
    border-radius: 4px;
    align-items: center;
    cursor: pointer;
  }
  .track-item:hover {
    background: rgba(255,255,255,0.1);
  }
  .track-item img {
    width: 50px;
    height: 50px;
    border-radius: 4px;
  }
  .track-number {
    color: #b3b3b3;
    text-align: center;
  }
  .track-title {
    color: white;
    font-weight: 500;
  }
  .track-artist {
    color: #b3b3b3;
    font-size: 14px;
  }
  .track-duration {
    color: #b3b3b3;
    text-align: right;
  }
  .delete-track-btn {
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid #555;
    color: #999;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .delete-track-btn:hover {
    background: #ff4444;
    border-color: #ff4444;
    color: white;
  }
  .empty-playlist {
    text-align: center;
    padding: 60px;
    color: #b3b3b3;
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
  .edit-modal, .confirm-modal {
    background: #282828;
    padding: 30px;
    border-radius: 12px;
    width: 400px;
    max-width: 90%;
  }
  .edit-modal h2, .confirm-modal h2 {
    margin: 0 0 20px 0;
    color: white;
  }
  .confirm-modal p {
    color: #b3b3b3;
    margin-bottom: 20px;
  }
  .modal-input, .modal-textarea, .modal-select {
    width: 100%;
    padding: 12px;
    background: #121212;
    border: 1px solid #555;
    border-radius: 4px;
    color: white;
    font-size: 16px;
    margin-bottom: 12px;
    font-family: inherit;
  }
  .modal-input:focus, .modal-textarea:focus, .modal-select:focus {
    outline: none;
    border-color: #1db954;
  }
  .modal-textarea {
    resize: vertical;
  }
  .modal-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  .modal-buttons button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 20px;
    font-weight: bold;
    cursor: pointer;
  }
  .modal-buttons button:first-child {
    background: transparent;
    border: 1px solid white;
    color: white;
  }
  .modal-buttons .save-btn {
    background: #1db954;
    color: white;
  }
  .modal-buttons .delete-btn {
    background: #ff4444;
    color: white;
  }
    .role-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
}
.role-selector label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: #181818;
  border-radius: 8px;
  cursor: pointer;
}
.role-selector label:hover {
  background: #282828;
}
.role-selector input[type="radio"] {
  margin-top: 4px;
}
.role-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.role-option strong {
  color: white;
}
.role-desc {
  color: #b3b3b3;
  font-size: 12px;
}
.generate-btn {
  width: 100%;
  padding: 12px;
  background: #1db954;
  border: none;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 12px;
}
.generate-btn:hover {
  background: #1ed760;
}
`;

export default PlaylistDetail;