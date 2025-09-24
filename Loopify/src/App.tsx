import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './page/Login';
import RegistPage from './page/Regist';
import Sidebar from './components/SideBar';
import MainContent from './components/content';

interface UserData {
  displayName: string;
  email?: string;
  country?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check for saved user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('loopifyUser');
    if (savedUser) {
      setCurrentUser({ displayName: savedUser });
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = (displayName: string) => {
    setCurrentUser({ displayName });
    setShowWelcomeMessage(true);
    setCurrentPage('home');
    
    // Hide welcome message after 3 seconds
    setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 3000);
  };

  // Handle logout with loading animation
  const handleLogout = () => {
    // Start logout process
    setIsLoggingOut(true);
    
    // Show loading for 2 seconds
    setTimeout(() => {
      // Clear user data
      setCurrentUser(null);
      localStorage.removeItem('loopifyUser');
      
      // Stop loading, show success message
      setIsLoggingOut(false);
      setShowLogoutMessage(true);
      
      // Hide success message after 2 more seconds
      setTimeout(() => {
        setShowLogoutMessage(false);
        setCurrentPage('home');
      }, 2000);
    }, 2000);
  };

  // Handle registration success (auto-redirect to login)
  const handleRegistrationSuccess = () => {
    setCurrentPage('login');
  };

  // All styles including messages and animations
  const appStyles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
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
      
      {/* Welcome Message */}
      {showWelcomeMessage && currentUser && (
        <div className="welcome-message">
          <span className="message-icon">🎵</span>
          <span>Welcome back, {currentUser.displayName}!</span>
        </div>
      )}
      
      {/* Logout Success Message */}
      {showLogoutMessage && !isLoggingOut && (
        <div className="logout-success-message">
          <span className="message-icon">👋</span>
          <span>Logout successful! See you soon!</span>
        </div>
      )}
      
      {/* Logout Loading Overlay */}
      {isLoggingOut && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <div className="logout-spinner"></div>
            <div className="logout-text">Logging out...</div>
          </div>
        </div>
      )}
      
      <Navbar 
        onLoginClick={() => setCurrentPage('login')} 
        onRegisterClick={() => setCurrentPage('register')}
        currentUser={currentUser}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar /> 
        <MainContent />
      </div>
    </div>
  );

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
    default:
      return mainAppLayout;
  }
}

export default App;