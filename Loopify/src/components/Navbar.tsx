import React, { useState } from 'react';
import FinalImage from "../assets/image_final2.png";

const combinedStyles = `
  /* --- Global Styles --- */
  body, html {
    margin: 0;
    padding: 0;
    background-color: #000; 
    font-family: sans-serif;
  }

  /* --- Navbar Styles --- */
  .navbar { display: flex; align-items: center; justify-content: space-between; padding: 8px 24px; background-color: #000; color: #b3b3b3; height: 64px; }
  .navbar-left { flex: 1; }
  .logo { height: 60px; width: auto; }
  .navbar-center { flex: 2; display: flex; justify-content: center; }
  .search-container { display: flex; align-items: center; background-color: #242424; border-radius: 50px; padding: 4px; width: 100%; max-width: 600px; }
  .search-input-wrapper { display: flex; align-items: center; flex-grow: 1; background-color: #242424; border-radius: 50px; padding: 0 12px; }
  .search-icon { margin-right: 8px; color: #b3b3b3; }
  .search-input { border: none; background-color: transparent; color: #ffffff; width: 100%; font-size: 14px; outline: none; }
  .navbar-right { flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: 16px; }
  .register-btn { background-color: #ffffff; color: #000000; border: none; border-radius: 50px; padding: 10px 24px; font-weight: bold; cursor: pointer; }
  .login-btn { background-color: transparent; color: #b3b3b3; border: none; border-radius: 50px; padding: 8px 16px; font-weight: bold; cursor: pointer; }
  .nav-icon-btn { background-color: #0a0a0a; border: none; border-radius: 50%; color: #b3b3b3; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .folder-icon { margin-left: 8px; }
  .profile-avatar { background-color: #535353; color: #ffffff; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; cursor: pointer; }

  /* --- Dropdown Styles --- */
  .notification-container { position: relative; }
  .notification-dropdown {
    position: absolute;
    top: 120%;
    right: 0;
    z-index: 10;
    width: 400px;
    background-color: #282828;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  .scroll-list-container { position: relative; width: 100%; }
  .scroll-list { max-height: 400px; overflow-y: auto; padding: 8px; }
  .item { padding: 12px 16px; background-color: transparent; border-radius: 4px; margin-bottom: 4px; transition: background-color 0.2s ease, opacity 0.3s ease; opacity: 0; animation: fadeIn 0.5s ease forwards; }
  .item:hover { background-color: #3e3e3e; }
  .item.selected { background-color: #3e3e3e; }
  .item-text { color: white; margin: 0; font-size: 14px; }
  @keyframes fadeIn { to { opacity: 1; } }
`;

// --- DropDownList Component ---
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

// --- Navbar Component ---
interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}
const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onRegisterClick }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const notifications = [ "New album from your favorite artist!", "Your weekly playlist is ready."];

  return (
    <>
      <style>{combinedStyles}</style>
      <header className="navbar">
        <div className="navbar-left">
          <img src={FinalImage} alt="Loopify Logo" className="logo" />
        </div>
        <div className="navbar-cnter">
          <div className="search-container">
            <button className="nav-icon-btn">
              {/* Home Icon*/}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.09961L3 10.9996V20.9996H8V14.9996H16V20.9996H21V10.9996L12 2.09961Z" fill="currentColor"/>
              </svg>
            </button>
            <div className="search-input-wrapper">
              {/* Search Icon*/}
              <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
              </svg>
              <input type="text" placeholder="What do you want to play?" className="search-input" />
              {/* Folder Icon*/}
              <button className="nav-icon-btn folder-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" fill="currentColor"/>
                  </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="navbar-right">
          <button className="login-btn" onClick={onLoginClick}>Login</button>
          <button className="register-btn" onClick={onRegisterClick}>Register</button>
          
          <div className="notification-container">
            <button className="nav-icon-btn" onClick={() => setDropdownOpen(!isDropdownOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"/>
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="notification-dropdown">
                <DropDownList items={notifications} />
              </div>
            )}
          </div>

          <div className="profile-avatar">
              <span>N</span>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;