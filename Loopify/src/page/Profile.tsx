import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../../config';

const profileStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .profile-page-container {
    min-height: 100vh;
    background: linear-gradient(180deg, #1a1a1a 0%, #121212 100%);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
    
  }

  .profile-content {
    padding: 40px 24px;
    max-width: 1200px;
    margin: 0 auto;
    background-color: #262524;
    border-radius: 5%;
    margin-top: 10px;
  }

  .profile-header {
    display: flex;
    align-items: flex-end;
    gap: 32px;
    margin-bottom: 48px;
    padding-bottom: 32px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .profile-avatar-section {
    position: relative;
  }

  .profile-avatar-large {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80px;
    font-weight: bold;
    color: white;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
  }

  .edit-avatar-button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 44px;
    height: 44px;
    background-color: #282828;
    border: 2px solid #121212;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .edit-avatar-button:hover {
    background-color: #3e3e3e;
    transform: scale(1.1);
  }

  .profile-info-header {
    flex: 1;
  }

  .profile-label {
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .profile-name {
    font-size: 72px;
    font-weight: 900;
    margin-bottom: 24px;
    line-height: 1;
  }

  .profile-stats {
    display: flex;
    gap: 24px;
    font-size: 16px;
    color: #b3b3b3;
  }

  .profile-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 600;
    color: white;
  }

  .profile-actions {
    display: flex;
    gap: 16px;
    margin-top: 24px;
  }

  .edit-profile-btn {
    padding: 12px 32px;
    background-color: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .edit-profile-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: white;
    transform: scale(1.02);
  }

  .profile-details-section {
    margin-bottom: 48px;
  }

  .section-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 24px;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
    background-color: #181818;
    padding: 32px;
    border-radius: 8px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .detail-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #b3b3b3;
  }

  .detail-value {
    font-size: 18px;
    font-weight: 500;
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .detail-icon {
    width: 24px;
    height: 24px;
    opacity: 0.7;
  }

  .not-specified {
    color: #666;
    font-style: italic;
  }

  .activity-section {
    margin-bottom: 48px;
  }

  .activity-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .activity-card {
    background-color: #181818;
    padding: 24px;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .activity-card:hover {
    background-color: #282828;
    transform: translateY(-4px);
  }

  .activity-title {
    font-size: 14px;
    color: #b3b3b3;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .activity-value {
    font-size: 32px;
    font-weight: 700;
    color: #1db954;
  }

  .activity-subtitle {
    font-size: 14px;
    color: #b3b3b3;
    margin-top: 4px;
  }

  .edit-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .edit-modal-content {
    background-color: #282828;
    padding: 32px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .modal-title {
    font-size: 24px;
    font-weight: 700;
  }

  .close-button {
    width: 32px;
    height: 32px;
    background-color: transparent;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
  }

  .close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #b3b3b3;
  }

  .form-input {
    width: 100%;
    padding: 12px;
    background-color: #3e3e3e;
    border: 1px solid #3e3e3e;
    border-radius: 6px;
    color: white;
    font-size: 16px;
    transition: all 0.2s ease;
  }

  .form-input:focus {
    outline: none;
    border-color: #1db954;
    background-color: #4a4a4a;
  }

  .form-select {
    width: 100%;
    padding: 12px;
    background-color: #3e3e3e;
    border: 1px solid #3e3e3e;
    border-radius: 6px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .form-select:focus {
    outline: none;
    border-color: #1db954;
    background-color: #4a4a4a;
  }

  .radio-group {
    display: flex;
    gap: 20px;
    margin-top: 8px;
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .radio-option input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #1db954;
  }

  .radio-option label {
    cursor: pointer;
    font-size: 16px;
  }

  .modal-actions {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    margin-top: 32px;
  }

  .cancel-btn {
    padding: 12px 24px;
    background-color: transparent;
    border: 1px solid #535353;
    border-radius: 50px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: white;
  }

  .save-btn {
    padding: 12px 24px;
    background-color: #1db954;
    border: none;
    border-radius: 50px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .save-btn:hover {
    background-color: #1ed760;
    transform: scale(1.02);
  }

  .back-button {
    position: fixed;
    top: 80px;
    left: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 100;
  }

  .back-button:hover {
    background-color: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateX(-2px);
  }

  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .profile-name {
      font-size: 48px;
    }

    .profile-avatar-large {
      width: 150px;
      height: 150px;
      font-size: 60px;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }
  }
`;

interface UserData {
  displayName: string;
  email?: string;
  country?: string;
  sex?: string;
}

interface ProfilePageProps {
  currentUser: UserData | null;
  onBackClick: () => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
  onUpdateUser?: (user: UserData) => void;  // Added this prop
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  currentUser, 
  onBackClick,
  onLogout,
  isLoggingOut = false,
  onUpdateUser  // Added this parameter
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserData>(currentUser || {
    displayName: '',
    email: '',
    country: '',
    sex: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setEditedUser(userData);
          // Update parent component if needed
          if (onUpdateUser) {
            onUpdateUser(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);
  useEffect(() => {
    if (currentUser) {
      setEditedUser(currentUser);
    }
  }, [currentUser]);
  const [userStats, setUserStats] = useState({
    PlaylistCount: 0,
    FollowerCount: 0,
    FollowingCount: 0,
    MinutesListened: 0,
    SongsLiked: 0
  });
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No auth token found');
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/user/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
        } else {
          console.log('Stats endpoint not available yet');
          // Keep default stats
        }
      } catch (error) {
        console.log('Stats feature coming soon');
        // Keep default stats
      }
    };
    
    fetchUserStats();
  }, []);
  
  // Then in your JSX:
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Update the user data through the parent component
    if (onUpdateUser) {
      onUpdateUser(editedUser);
    } else {
      // Fallback to localStorage if no update function provided
      localStorage.setItem('loopifyUser', JSON.stringify(editedUser));
      window.location.reload();
    }
    
    setIsEditing(false);
  };

  const getAvatarLetter = () => {
    return currentUser?.displayName?.charAt(0).toUpperCase() || 'U';
  };

  const countries = [
    'Thailand', 'United States', 'United Kingdom', 'Japan', 'South Korea',
    'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam',
    'Australia', 'Canada', 'Germany', 'France', 'Spain', 'Other'
  ];

    function handleProfileClick(): void {
        throw new Error('Function not implemented.');
    }

  return (
    <>
      <style>{profileStyles}</style>
      <div className="profile-page-container">
      <Navbar
            onLoginClick={() => {}}
            onRegisterClick={() => {}}
            currentUser={currentUser}
            onLogout={onLogout}
            isLoggingOut={isLoggingOut}
            onProfileClick={handleProfileClick} // Add this line if needed
            />
        
        {/* Back Button */}
        <button className="back-button" onClick={onBackClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          <span>Back to Home</span>
        </button>
        
        <div className="profile-content">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {getAvatarLetter()}
              </div>
              <div className="edit-avatar-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 20H5a2 2 0 01-2-2V11l3.5-3.5 1.42 1.42L5 11.83V18h7v2zM15 10l4-4-4-4v3H9v2h6v3zm6-2l-8 8-4-4 1.41-1.41L12 12.17 19.59 4.59 21 6z"/>
                </svg>
              </div>
            </div>
            
            <div className="profile-info-header">
              <p className="profile-label">PROFILE</p>
              <h1 className="profile-name">{currentUser?.displayName || 'User'}</h1>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-value">{userStats.PlaylistCount}</span>
                  <span>Playlists</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-value">{userStats.FollowerCount}</span>
                  <span>Followers</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-value">{userStats.FollowingCount}</span>
                  <span>Following</span>
                </div>
              </div>
              <div className="profile-actions">
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="profile-details-section">
            <h2 className="section-title">Account Information</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Display Name</span>
                <div className="detail-value">
                  <svg className="detail-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  {currentUser?.displayName || <span className="not-specified">Not specified</span>}
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <div className="detail-value">
                  <svg className="detail-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  {currentUser?.email || <span className="not-specified">Not specified</span>}
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Country</span>
                <div className="detail-value">
                  <svg className="detail-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                  </svg>
                  {currentUser?.country || <span className="not-specified">Not specified</span>}
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <div className="detail-value">
                  <svg className="detail-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                  {currentUser?.sex ? 
                    currentUser.sex.charAt(0).toUpperCase() + currentUser.sex.slice(1) : 
                    <span className="not-specified">Not specified</span>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="activity-section">
            <h2 className="section-title">Your Activity</h2>
            <div className="activity-cards">
              <div className="activity-card">
                <p className="activity-title">Minutes Listened</p>
                <p className="activity-value">0</p>
                <p className="activity-subtitle">This month</p>
              </div>
              <div className="activity-card">
                <p className="activity-title">Top Genre</p>
                <p className="activity-value">--</p>
                <p className="activity-subtitle">Most played</p>
              </div>
              <div className="activity-card">
                <p className="activity-title">Songs Liked</p>
                <p className="activity-value">0</p>
                <p className="activity-subtitle">Total favorites</p>
              </div>
              <div className="activity-card">
                <p className="activity-title">Artists Followed</p>
                <p className="activity-value">0</p>
                <p className="activity-subtitle">Growing collection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <div className="modal-header">
                <h2 className="modal-title">Edit Profile</h2>
                <button className="close-button" onClick={() => setIsEditing(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  className="form-input"
                  value={editedUser.displayName}
                  onChange={handleInputChange}
                  placeholder="Enter display name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={editedUser.email || ''}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <select
                  name="country"
                  className="form-select"
                  value={editedUser.country || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <div className="radio-group">
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="male"
                      name="sex"
                      value="male"
                      checked={editedUser.sex === 'male'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="male">Male</label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="female"
                      name="sex"
                      value="female"
                      checked={editedUser.sex === 'female'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="female">Female</label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="other"
                      name="sex"
                      value="other"
                      checked={editedUser.sex === 'other'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="other">Other</label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;