import React, { useState, useEffect } from 'react';

// Interfaces
interface User {
  userId: string;
  displayName: string;
  avatar?: string;
}

interface Track {
  trackId: string;
  title: string;
  artist: string;
  duration: string;
  coverUrl: string;
  addedBy: User;
  addedAt: Date;
  votes: number;
  votedBy: string[]; // userIds who voted
}

interface PlaylistMember {
  userId: string;
  displayName: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  avatar?: string;
}

interface CollaborativePlaylist {
  playlistId: string;
  title: string;
  description: string;
  visibility: 'private' | 'shared' | 'public';
  members: PlaylistMember[];
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
}

interface CollaborativePlaylistProps {
  currentUserId: string;
  playlistId?: string;
  onClose: () => void;
}

const CollaborativePlaylist: React.FC<CollaborativePlaylistProps> = ({ currentUserId, playlistId, onClose }) => {
  const [playlist, setPlaylist] = useState<CollaborativePlaylist | null>(null);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks' | 'members' | 'activity'>('tracks');
  const [isCreating, setIsCreating] = useState(!playlistId);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    if (playlistId) {
      // Fetch existing playlist
      setPlaylist({
        playlistId: playlistId,
        title: 'Summer Vibes 2025',
        description: 'Our collaborative summer playlist!',
        visibility: 'shared',
        members: [
          { userId: '1', displayName: 'You', role: 'owner', joinedAt: new Date(), avatar: 'https://picsum.photos/40?random=1' },
          { userId: '2', displayName: 'Sarah', role: 'editor', joinedAt: new Date(), avatar: 'https://picsum.photos/40?random=2' },
          { userId: '3', displayName: 'Mike', role: 'editor', joinedAt: new Date(), avatar: 'https://picsum.photos/40?random=3' },
          { userId: '4', displayName: 'Emma', role: 'viewer', joinedAt: new Date(), avatar: 'https://picsum.photos/40?random=4' },
        ],
        tracks: [
          {
            trackId: '1',
            title: 'Blinding Lights',
            artist: 'The Weeknd',
            duration: '3:20',
            coverUrl: 'https://picsum.photos/50?random=11',
            addedBy: { userId: '2', displayName: 'Sarah' },
            addedAt: new Date(),
            votes: 3,
            votedBy: ['1', '2', '3']
          },
          {
            trackId: '2',
            title: 'Levitating',
            artist: 'Dua Lipa',
            duration: '3:23',
            coverUrl: 'https://picsum.photos/50?random=12',
            addedBy: { userId: '3', displayName: 'Mike' },
            addedAt: new Date(),
            votes: 2,
            votedBy: ['1', '3']
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mock activity
      setRecentActivity([
        { type: 'add', user: 'Sarah', track: 'Blinding Lights', time: '2 hours ago' },
        { type: 'vote', user: 'Mike', track: 'Levitating', time: '3 hours ago' },
        { type: 'join', user: 'Emma', time: '1 day ago' },
      ]);
    }
  }, [playlistId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Mock search results
    if (query.length > 0) {
      setSearchResults([
        {
          trackId: '3',
          title: 'Heat Waves',
          artist: 'Glass Animals',
          duration: '3:58',
          coverUrl: 'https://picsum.photos/50?random=13',
          addedBy: { userId: currentUserId, displayName: 'You' },
          addedAt: new Date(),
          votes: 0,
          votedBy: []
        },
        {
          trackId: '4',
          title: 'good 4 u',
          artist: 'Olivia Rodrigo',
          duration: '2:58',
          coverUrl: 'https://picsum.photos/50?random=14',
          addedBy: { userId: currentUserId, displayName: 'You' },
          addedAt: new Date(),
          votes: 0,
          votedBy: []
        }
      ]);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddTrack = (track: Track) => {
    if (playlist) {
      const newTrack = {
        ...track,
        addedBy: { userId: currentUserId, displayName: 'You' },
        addedAt: new Date(),
        votes: 0,
        votedBy: []
      };
      setPlaylist({
        ...playlist,
        tracks: [...playlist.tracks, newTrack]
      });
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleVote = (trackId: string) => {
    if (playlist) {
      const updatedTracks = playlist.tracks.map(track => {
        if (track.trackId === trackId) {
          const hasVoted = track.votedBy.includes(currentUserId);
          if (hasVoted) {
            return {
              ...track,
              votes: track.votes - 1,
              votedBy: track.votedBy.filter(id => id !== currentUserId)
            };
          } else {
            return {
              ...track,
              votes: track.votes + 1,
              votedBy: [...track.votedBy, currentUserId]
            };
          }
        }
        return track;
      });
      setPlaylist({
        ...playlist,
        tracks: updatedTracks.sort((a, b) => b.votes - a.votes)
      });
    }
  };

  const handleInviteMember = () => {
    if (inviteEmail && playlist) {
      // Simulate adding a new member
      const newMember: PlaylistMember = {
        userId: Date.now().toString(),
        displayName: inviteEmail.split('@')[0],
        role: 'editor',
        joinedAt: new Date(),
        avatar: `https://picsum.photos/40?random=${Date.now()}`
      };
      setPlaylist({
        ...playlist,
        members: [...playlist.members, newMember]
      });
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  const handleCreatePlaylist = () => {
    const newPlaylist: CollaborativePlaylist = {
      playlistId: Date.now().toString(),
      title: playlistTitle,
      description: playlistDescription,
      visibility: 'shared',
      members: [{
        userId: currentUserId,
        displayName: 'You',
        role: 'owner',
        joinedAt: new Date(),
        avatar: 'https://picsum.photos/40?random=1'
      }],
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPlaylist(newPlaylist);
    setIsCreating(false);
  };

  const currentUserRole = playlist?.members.find(m => m.userId === currentUserId)?.role;
  const canEdit = currentUserRole === 'owner' || currentUserRole === 'editor';

  return (
    <>
      <style>{styles}</style>
      <div className="collab-playlist-container">
        <div className="collab-header">
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
          
          {isCreating ? (
            <div className="create-playlist-form">
              <h2>Create Collaborative Playlist</h2>
              <input
                type="text"
                placeholder="Playlist name"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                className="playlist-input"
              />
              <textarea
                placeholder="Description (optional)"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                className="playlist-textarea"
              />
              <button 
                onClick={handleCreatePlaylist}
                className="create-btn"
                disabled={!playlistTitle}
              >
                Create Playlist
              </button>
            </div>
          ) : (
            <>
              <div className="playlist-info">
                <h1>{playlist?.title}</h1>
                <p>{playlist?.description}</p>
                <div className="members-preview">
                  {playlist?.members.slice(0, 3).map(member => (
                    <img
                      key={member.userId}
                      src={member.avatar}
                      alt={member.displayName}
                      className="member-avatar-small"
                      title={member.displayName}
                    />
                  ))}
                  {playlist && playlist.members.length > 3 && (
                    <span className="more-members">+{playlist.members.length - 3}</span>
                  )}
                </div>
              </div>
              
              {canEdit && (
                <button 
                  className="invite-btn"
                  onClick={() => setShowInviteModal(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Invite
                </button>
              )}
            </>
          )}
        </div>

        {!isCreating && playlist && (
          <>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'tracks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tracks')}
              >
                Tracks ({playlist.tracks.length})
              </button>
              <button 
                className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveTab('members')}
              >
                Members ({playlist.members.length})
              </button>
              <button 
                className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                Activity
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'tracks' && (
                <div className="tracks-section">
                  {canEdit && (
                    <div className="search-section">
                      <input
                        type="text"
                        placeholder="Search for songs to add..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="search-input"
                      />
                      {searchResults.length > 0 && (
                        <div className="search-results">
                          {searchResults.map(track => (
                            <div key={track.trackId} className="search-result-item">
                              <img src={track.coverUrl} alt={track.title} />
                              <div className="track-info">
                                <span className="track-title">{track.title}</span>
                                <span className="track-artist">{track.artist}</span>
                              </div>
                              <button 
                                className="add-track-btn"
                                onClick={() => handleAddTrack(track)}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="playlist-tracks">
                    {playlist.tracks.map((track, index) => (
                      <div key={track.trackId} className="track-item">
                        <span className="track-number">{index + 1}</span>
                        <img src={track.coverUrl} alt={track.title} className="track-cover" />
                        <div className="track-details">
                          <span className="track-title">{track.title}</span>
                          <span className="track-artist">{track.artist} • Added by {track.addedBy.displayName}</span>
                        </div>
                        <button 
                          className={`vote-btn ${track.votedBy.includes(currentUserId) ? 'voted' : ''}`}
                          onClick={() => handleVote(track.trackId)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.85-1.26l3.03-7.86c.09-.23.12-.47.12-.72v-2z"/>
                          </svg>
                          {track.votes}
                        </button>
                        <span className="track-duration">{track.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="members-section">
                  {playlist.members.map(member => (
                    <div key={member.userId} className="member-item">
                      <img src={member.avatar} alt={member.displayName} className="member-avatar" />
                      <div className="member-info">
                        <span className="member-name">{member.displayName}</span>
                        <span className="member-role">{member.role}</span>
                      </div>
                      {currentUserRole === 'owner' && member.userId !== currentUserId && (
                        <select 
                          className="role-selector"
                          value={member.role}
                          onChange={(e) => {
                            // Update member role
                          }}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="activity-section">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'add' && '➕'}
                        {activity.type === 'vote' && '👍'}
                        {activity.type === 'join' && '👋'}
                      </div>
                      <div className="activity-details">
                        <span className="activity-text">
                          <strong>{activity.user}</strong>
                          {activity.type === 'add' && ` added "${activity.track}"`}
                          {activity.type === 'vote' && ` voted for "${activity.track}"`}
                          {activity.type === 'join' && ' joined the playlist'}
                        </span>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {showInviteModal && (
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
            <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Invite Members</h3>
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="invite-input"
              />
              <div className="modal-actions">
                <button onClick={() => setShowInviteModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={handleInviteMember} className="send-invite-btn">
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const styles = `
  .collab-playlist-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #121212;
    z-index: 2500;
    display: flex;
    flex-direction: column;
    color: white;
  }

  .collab-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
  }

  .playlist-info h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
  }

  .playlist-info p {
    margin: 0 0 12px 0;
    color: #b3b3b3;
  }

  .members-preview {
    display: flex;
    align-items: center;
    gap: -8px;
  }

  .member-avatar-small {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid #121212;
    margin-right: -8px;
  }

  .more-members {
    margin-left: 12px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 12px;
  }

  .invite-btn {
    background: #1db954;
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .tabs {
    display: flex;
    gap: 24px;
    padding: 0 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tab {
    background: none;
    border: none;
    color: #b3b3b3;
    padding: 16px 0;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    position: relative;
  }

  .tab.active {
    color: white;
  }

  .tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #1db954;
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .search-section {
    margin-bottom: 24px;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 14px;
  }

  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #282828;
    border-radius: 8px;
    margin-top: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  .search-result-item {
    display: flex;
    align-items: center;
    padding: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .search-result-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .search-result-item img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    margin-right: 12px;
  }

  .track-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .track-title {
    font-size: 14px;
    font-weight: 600;
  }

  .track-artist {
    font-size: 12px;
    color: #b3b3b3;
  }

  .add-track-btn {
    background: #1db954;
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .playlist-tracks {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .track-item {
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .track-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .track-number {
    width: 24px;
    text-align: center;
    color: #b3b3b3;
    font-size: 14px;
  }

  .track-cover {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    margin: 0 12px;
  }

  .track-details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .vote-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 4px 12px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    margin-right: 16px;
  }

  .vote-btn.voted {
    background: #1db954;
  }

  .track-duration {
    color: #b3b3b3;
    font-size: 14px;
  }

  .members-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .member-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .member-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 16px;
  }

  .member-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .member-name {
    font-weight: 600;
  }

  .member-role {
    font-size: 12px;
    color: #b3b3b3;
  }

  .role-selector {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .activity-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .activity-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .activity-details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .activity-text {
    font-size: 14px;
  }

  .activity-time {
    font-size: 12px;
    color: #b3b3b3;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
  }

  .invite-modal {
    background: #282828;
    padding: 24px;
    border-radius: 12px;
    width: 400px;
  }

  .invite-modal h3 {
    margin: 0 0 16px 0;
  }

  .invite-input {
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: white;
    margin-bottom: 16px;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .cancel-btn, .send-invite-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
  }

  .cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .send-invite-btn {
    background: #1db954;
    color: white;
  }

  .create-playlist-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 500px;
  }

  .playlist-input {
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 16px;
  }

  .playlist-textarea {
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    min-height: 100px;
    resize: vertical;
  }

  .create-btn {
    background: #1db954;
    border: none;
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    align-self: flex-start;
  }

  .create-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default CollaborativePlaylist;