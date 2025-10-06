import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

interface JoinPlaylistPageProps {
  inviteCode: string;
  onBackClick: () => void;
  currentUser: any;
}

const JoinPlaylistPage: React.FC<JoinPlaylistPageProps> = ({ inviteCode, onBackClick, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleJoinPlaylist = async () => {
    if (!currentUser) {
      alert('Please login to join this playlist');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/playlists/join/${inviteCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        setTimeout(() => {
          onBackClick();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to join playlist');
      }
    } catch (err) {
      console.error('Join error:', err);
      setError('Failed to join playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="join-page">
        <div className="join-container">
          <button className="back-btn" onClick={onBackClick}>
            ← Back
          </button>
          
          <div className="join-content">
            <h1>Join Playlist</h1>
            
            {!currentUser ? (
              <div className="warning-box">
                <p>You need to be logged in to join this playlist</p>
              </div>
            ) : success ? (
              <div className="success-box">
                <p>Successfully joined playlist! Redirecting...</p>
              </div>
            ) : error ? (
              <div className="error-box">
                <p>{error}</p>
                <button className="retry-btn" onClick={handleJoinPlaylist}>
                  Try Again
                </button>
              </div>
            ) : (
              <div className="join-box">
                <p>You've been invited to join a playlist</p>
                <button 
                  className="join-btn" 
                  onClick={handleJoinPlaylist}
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join Playlist'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const pageStyles = `
body, html {
    margin: 0;
    padding: 0;
    background-color: #000; 
}
  .join-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .join-container {
    max-width: 500px;
    width: 100%;
  }
  .back-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    margin-bottom: 30px;
  }
  .back-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  .join-content {
    background: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }
  .join-content h1 {
    margin: 0 0 30px 0;
    text-align: center;
    color: #333;
  }
  .join-box, .warning-box, .error-box, .success-box {
    text-align: center;
    padding: 30px;
    border-radius: 8px;
  }
  .join-box {
    background: #f8f9fa;
  }
  .join-box p {
    margin: 0 0 20px 0;
    color: #666;
  }
  .join-btn {
    background: #1db954;
    color: white;
    border: none;
    padding: 12px 40px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  }
  .join-btn:hover {
    background: #1ed760;
  }
  .join-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .warning-box {
    background: #fff3cd;
    color: #856404;
  }
  .error-box {
    background: #f8d7da;
    color: #721c24;
  }
  .success-box {
    background: #d4edda;
    color: #155724;
  }
  .retry-btn {
    margin-top: 15px;
    background: transparent;
    border: 2px solid #721c24;
    color: #721c24;
    padding: 8px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
  }
`;

export default JoinPlaylistPage;