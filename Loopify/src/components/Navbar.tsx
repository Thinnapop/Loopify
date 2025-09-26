import React, { useState, useEffect, useRef } from 'react';
import FinalImage from "../assets/image_final2.png";

const navbarStyles = `
  /* --- Navbar Styles --- */
  .navbar { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    padding: 8px 24px; 
    background-color: #000; 
    color: #b3b3b3; 
    height: 64px; 
  }
  
  .navbar-left { flex: 1; }
  .logo { height: 60px; width: auto; }
  .navbar-center { flex: 2; display: flex; justify-content: center; }
  
  .search-container { 
    display: flex; 
    align-items: center; 
    background-color: #242424; 
    border-radius: 50px; 
    padding: 4px; 
    width: 100%; 
    max-width: 600px; 
  }
  
  .search-input-wrapper { 
    display: flex; 
    align-items: center; 
    flex-grow: 1; 
    background-color: #242424; 
    border-radius: 50px; 
    padding: 0 12px; 
  }
  
  .search-icon { margin-right: 8px; color: #b3b3b3; }
  
  .search-input { 
    border: none; 
    background-color: transparent; 
    color: #ffffff; 
    width: 100%; 
    font-size: 14px; 
    outline: none; 
  }
  
  .navbar-right { 
    flex: 1; 
    display: flex; 
    justify-content: flex-end; 
    align-items: center; 
    gap: 16px; 
  }
  
  .register-btn { 
    background-color: #ffffff; 
    color: #000000; 
    border: none; 
    border-radius: 50px; 
    padding: 10px 24px; 
    font-weight: bold; 
    cursor: pointer; 
    transition: all 0.2s ease;
  }
  
  .register-btn:hover {
    background-color: #f0f0f0;
    transform: scale(1.02);
  }
  
  .login-btn { 
    background-color: transparent; 
    color: #b3b3b3; 
    border: none; 
    border-radius: 50px; 
    padding: 8px 16px; 
    font-weight: bold; 
    cursor: pointer; 
    transition: all 0.2s ease;
  }
  
  .login-btn:hover {
    color: #ffffff;
  }
  
  .nav-icon-btn { 
    background-color: #0a0a0a; 
    border: none; 
    border-radius: 50%; 
    color: #b3b3b3; 
    width: 40px; 
    height: 40px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    transition: all 0.2s ease;
  }
  
  .nav-icon-btn:hover {
    background-color: #1a1a1a;
    color: #ffffff;
  }
  
  .folder-icon { margin-left: 8px; }
  
  /* Profile Avatar and Dropdown */
  .profile-container {
    position: relative;
  }
  
  .profile-avatar { 
    background-color: #535353; 
    color: #ffffff; 
    border-radius: 50%; 
    width: 36px; 
    height: 36px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-weight: bold; 
    font-size: 16px; 
    cursor: pointer; 
    transition: all 0.2s ease;
    user-select: none;
  }
  
  .profile-avatar:hover {
    background-color: #6e6e6e;
    transform: scale(1.05);
  }
  
  .profile-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background-color: #282828;
    border-radius: 4px;
    box-shadow: 0 16px 24px rgba(0, 0, 0, 0.8);
    min-width: 260px;
    z-index: 1000;
    overflow: hidden;
    animation: dropdownFadeIn 0.2s ease;
  }
  
  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .profile-info {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .profile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .profile-avatar-large {
    width: 48px;
    height: 48px;
    background-color: #535353;
    color: #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
  }
  
  .profile-name {
    flex: 1;
  }
  
  .profile-display-name {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 4px 0;
  }
  
  .profile-type {
    font-size: 12px;
    color: #b3b3b3;
    margin: 0;
  }
  
  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .profile-detail-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #b3b3b3;
  }
  
  .profile-detail-icon {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }
  
  .profile-actions {
    padding: 8px;
  }
  
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 3px;
    color: #ffffff;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 14px;
  }
  
  .dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .dropdown-item.loading {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .dropdown-item.loading:hover {
    background-color: transparent;
  }
  
  .dropdown-item-icon {
    width: 16px;
    height: 16px;
  }
  
  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .dropdown-divider {
    height: 1px;
    background-color: rgba(255, 255, 255, 0.1);
    margin: 8px 0;
  }
  
  .logout-item {
    color: #ffffff;
  }
  
  .logout-item:hover {
    background-color: rgba(244, 67, 54, 0.1);
  }
  
  /* Notification Dropdown */
  .notification-container { position: relative; }
  
  .notification-dropdown {
    position: absolute;
    top: 120%;
    right: 0;
    z-index: 10;
    width: 275px;
    background-color: #282828;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  
  .scroll-list-container { position: relative; width: 100%; }
  .scroll-list { max-height: 400px; overflow-y: auto; padding: 8px; }
  
  .item { 
    padding: 12px 16px; 
    background-color: transparent; 
    border-radius: 4px; 
    margin-bottom: 4px; 
    transition: background-color 0.2s ease, opacity 0.3s ease; 
    opacity: 0; 
    animation: fadeIn 0.5s ease forwards; 
  }
  
  .item:hover { background-color: #3e3e3e; }
  .item.selected { background-color: #3e3e3e; }
  .item-text { color: white; margin: 0; font-size: 14px; }
  
  @keyframes fadeIn { to { opacity: 1; } }
`;

// DropDownList Component
interface DropDownListProps { items?: string[]; }
const DropDownList: React.FC<DropDownListProps> = ({ items = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  return (
    <div className="scroll-list-container">
      <div className="scroll-list">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={`item ${selectedIndex === index ? 'selected' : ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => setSelectedIndex(index)}
          >
            <p className="item-text">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// UserData interface - Updated to include all registration fields
interface UserData {
  displayName: string;
  email?: string;
  country?: string;
  sex?: string;
}

// Navbar Props - Updated to include isLoadingProfile
interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  currentUser?: UserData | null;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  onProfileClick?: () => void;
  isLoadingProfile?: boolean; // Add this prop
}

const Navbar: React.FC<NavbarProps> = ({ 
  onLoginClick, 
  onRegisterClick, 
  currentUser, 
  onLogout, 
  isLoggingOut = false,
  onProfileClick,
  isLoadingProfile = false // Add this parameter
}) => {
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const notifications = [ 
    "New song from your favorite artist has been released!", 
    "Your weekly playlist is ready."
  ];

  // Get first letter for avatar
  const getAvatarLetter = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setProfileOpen(!isProfileOpen);
    setNotificationOpen(false); // Close notification if open
  };

  const handleNotificationClick = () => {
    setNotificationOpen(!isNotificationOpen);
    setProfileOpen(false); // Close profile if open
  };

  const handleLogoutClick = () => {
    setProfileOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleProfileMenuClick = () => {
    if (!isLoadingProfile && onProfileClick) { // Prevent clicking during loading
      setProfileOpen(false); // Close dropdown
      onProfileClick(); // Call the navigation function
    }
  };

  return (
    <>
      <style>{navbarStyles}</style>
      <header className="navbar">
        <div className="navbar-left">
          <img src={FinalImage} alt="Loopify Logo" className="logo" />
        </div>
        
        <div className="navbar-center">
          <div className="search-container">
            <button className="nav-icon-btn">
              {/* Home Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2.09961L3 10.9996V20.9996H8V14.9996H16V20.9996H21V10.9996L12 2.09961Z" fill="currentColor"/>
              </svg>
            </button>
            <div className="search-input-wrapper">
              {/* Search Icon */}
              <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
              </svg>
              <input type="text" placeholder="What do you want to play?" className="search-input" />
              {/* Folder Icon */}
              <button className="nav-icon-btn folder-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="navbar-right">
          {currentUser ? (
            <>
              {/* Notification Icon */}
              <div className="notification-container" ref={notificationRef}>
                <button className="nav-icon-btn" onClick={handleNotificationClick}>
                  <svg width="16" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"/>
                  </svg>
                </button>
                {isNotificationOpen && (
                  <div className="notification-dropdown">
                    <DropDownList items={notifications} />
                  </div>
                )}
              </div>

              {/* Profile Avatar with Dropdown */}
              <div className="profile-container" ref={profileRef}>
                <div className="profile-avatar" onClick={handleProfileClick}>
                  <span>{getAvatarLetter()}</span>
                </div>
                
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-info">
                      <div className="profile-header">
                        <div className="profile-avatar-large">
                          {getAvatarLetter()}
                        </div>
                        <div className="profile-name">
                          <p className="profile-display-name">{currentUser.displayName}</p>
                        </div>
                      </div>
                      <div className="profile-details">
                        {currentUser.email && (
                          <div className="profile-detail-row">
                            <svg className="profile-detail-icon" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M2.5 3A1.5 1.5 0 001 4.5v.793l6.5 3.898L14 5.293V4.5A1.5 1.5 0 0012.5 3h-10zm11.5 3.021L7.5 9.919 1 6.021V11.5A1.5 1.5 0 002.5 13h10a1.5 1.5 0 001.5-1.5V6.021z"/>
                            </svg>
                            <span>{currentUser.email || 'No email provided'}</span>
                          </div>
                        )}
                        
                        {currentUser.country && (
                          <div className="profile-detail-row">
                            <svg className="profile-detail-icon" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1 8a7 7 0 0113.95.76l-2.37-1.03a3.5 3.5 0 00-2.08-2.08L9.5 3.31a1.5 1.5 0 00-3 0l-1 2.34a3.5 3.5 0 00-2.08 2.08L1.05 8.76A6.97 6.97 0 011 8z"/>
                            </svg>
                            <span>{currentUser.country || 'Not specified'}</span>
                          </div>
                        )}
                        
                        {currentUser.sex && (
                          <div className="profile-detail-row">
                            <svg className="profile-detail-icon" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 1a4 4 0 100 8 4 4 0 000-8zM2 12a6 6 0 0112 0H2z"/>
                            </svg>
                            <span>{currentUser.sex ? currentUser.sex.charAt(0).toUpperCase() + currentUser.sex.slice(1) : 'Not specified'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="profile-actions">
                      <div 
                        className={`dropdown-item ${isLoadingProfile ? 'loading' : ''}`}
                        onClick={handleProfileMenuClick}
                      >
                        {isLoadingProfile ? (
                          <div className="loading-spinner"></div>
                        ) : (
                          <svg className="dropdown-item-icon" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1a4 4 0 100 8 4 4 0 000-8zM2 12a6 6 0 0112 0H2z"/>
                          </svg>
                        )}
                        <span>{isLoadingProfile ? 'Loading profile...' : 'Profile'}</span>
                      </div>
                      
                      <div 
                        className="dropdown-item"
                        onClick={() => console.log('Settings clicked')}
                      >
                        <svg className="dropdown-item-icon" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 4.754a3.246 3.246 0 100 6.492 3.246 3.246 0 000-6.492zM5.754 8a2.246 2.246 0 114.492 0 2.246 2.246 0 01-4.492 0z"/>
                          <path d="M9.796 1.343l-.527 1.028a.61.61 0 00.066.711c.427.427.695.976.695 1.583s-.268 1.156-.695 1.583a.61.61 0 00-.066.711l.527 1.028a.61.61 0 00.778.277 3.89 3.89 0 001.456-.844l.862.497a.61.61 0 00.711-.066c.427-.427.976-.695 1.583-.695s1.156.268 1.583.695a.61.61 0 00.711.066l1.028-.527a.61.61 0 00.277-.778 3.89 3.89 0 00-.844-1.456l.497-.862a.61.61 0 00-.066-.711c-.427-.427-.695-.976-.695-1.583s.268-1.156.695-1.583a.61.61 0 00.066-.711l-.527-1.028a.61.61 0 00-.778-.277 3.89 3.89 0 00-1.456.844l-.862-.497a.61.61 0 00-.711.066c-.427.427-.976.695-1.583.695s-1.156-.268-1.583-.695a.61.61 0 00-.711-.066l-1.028.527a.61.61 0 00-.277.778c.202.508.472.98.844 1.456z"/>
                        </svg>
                        <span>Settings</span>
                      </div>
                      
                      <div className="dropdown-divider"></div>
                      
                      <div 
                        className="dropdown-item logout-item"
                        onClick={handleLogoutClick}
                      >
                        <svg className="dropdown-item-icon" viewBox="0 0 16 16" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h8a.5.5 0 00.5-.5v-2a.5.5 0 011 0v2A1.5 1.5 0 019.5 14h-8A1.5 1.5 0 010 12.5v-9A1.5 1.5 0 011.5 2h8A1.5 1.5 0 0111 3.5v2a.5.5 0 01-1 0v-2z"/>
                          <path fillRule="evenodd" d="M4.146 8.354a.5.5 0 010-.708l3-3a.5.5 0 11.708.708L5.707 7.5H14.5a.5.5 0 010 1H5.707l2.147 2.146a.5.5 0 01-.708.708l-3-3z"/>
                        </svg>
                        <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="login-btn" onClick={onLoginClick}>Login</button>
              <button className="register-btn" onClick={onRegisterClick}>Register</button>
            </>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;