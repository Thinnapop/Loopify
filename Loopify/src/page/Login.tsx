import React, { useState, useEffect } from 'react';

const pageStyles = `
  body, html {
    margin: 0;
    padding: 0;
    background-color: #000; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  
  .page-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(180deg, #1a1a1a 0%, #121212 100%);
    color: white;
    padding: 20px;
  }
  
  .form-box {
    background-color: #282828;
    padding: 48px 40px;
    border-radius: 12px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }
  
  .logo-container {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .logo-text {
    font-size: 40px;
    font-weight: bold;
    color: #1db954;
    margin: 0;
  }
  
  .form-box h1 { 
    margin-bottom: 32px;
    font-size: 28px;
    text-align: center;
    font-weight: 600;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
  }
  
  .form-box input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 6px;
    border: 1px solid #3e3e3e;
    background-color: #3e3e3e;
    color: white;
    font-size: 14px;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  
  .form-box input:focus {
    outline: none;
    border-color: #1db954;
    background-color: #4a4a4a;
  }
  
  .form-box input::placeholder {
    color: #8e8e8e;
  }
  
  .remember-me {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .remember-me input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
    cursor: pointer;
    accent-color: #1db954;
  }
  
  .remember-me label {
    cursor: pointer;
    font-size: 14px;
    color: #b3b3b3;
  }
  
  .form-box button {
    width: 100%;
    padding: 14px;
    border-radius: 50px;
    border: none;
    background-color: #1db954;
    color: white;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .form-box button:hover:not(:disabled) {
    background-color: #1ed760;
    transform: scale(1.02);
  }
  
  .form-box button:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  .form-box button:disabled {
    background-color: #3e3e3e;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .error-message {
    color: #f44336;
    margin-bottom: 15px;
    font-size: 14px;
    text-align: center;
    padding: 10px;
    background-color: rgba(244, 67, 54, 0.1);
    border-radius: 4px;
    animation: shake 0.5s;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .forgot-password {
    text-align: center;
    margin-top: 16px;
  }
  
  .forgot-password a {
    color: #b3b3b3;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s ease;
  }
  
  .forgot-password a:hover {
    color: #fff;
    text-decoration: underline;
  }
  
  .divider {
    margin: 32px 0;
    text-align: center;
    position: relative;
  }
  
  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #3e3e3e;
  }
  
  .divider span {
    background-color: #282828;
    padding: 0 16px;
    position: relative;
    color: #b3b3b3;
    font-size: 12px;
    text-transform: uppercase;
  }
  
  .social-login {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .social-button {
    width: 100%;
    padding: 12px;
    border-radius: 50px;
    border: 1px solid #535353;
    background-color: transparent;
    color: white;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .social-button:hover {
    background-color: #3e3e3e;
    border-color: #fff;
  }
  
  .signup-link {
    text-align: center;
    color: #b3b3b3;
    font-size: 14px;
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #3e3e3e;
  }
  
  .signup-link a {
    color: #1db954;
    text-decoration: none;
    font-weight: bold;
  }
  
  .signup-link a:hover {
    text-decoration: underline;
  }
  
  .back-link {
    margin-top: 16px;
    text-align: center;
    cursor: pointer;
    color: #b3b3b3;
    font-size: 14px;
  }
  
  .back-link:hover {
    color: #fff;
    text-decoration: underline;
  }
  
  .demo-hint {
    background-color: rgba(29, 185, 84, 0.1);
    border: 1px solid #1db954;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 20px;
    font-size: 13px;
    color: #1ed760;
    text-align: center;
  }
`;

interface LoginPageProps {
  onBackClick: () => void;
  onLoginSuccess: (displayName: string) => void;
  onRegisterClick?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBackClick, onLoginSuccess, onRegisterClick }) => {
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user just registered and pre-fill display name
  useEffect(() => {
    const registeredUser = localStorage.getItem('registeredUser');
    if (registeredUser) {
      try {
        const userData = JSON.parse(registeredUser);
        setDisplayName(userData.displayName || '');
      } catch (error) {
        console.error('Error parsing registered user data');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Get registered user data if available
      let userData: any = { displayName };
      const registeredUser = localStorage.getItem('registeredUser');
      
      if (registeredUser) {
        try {
          const parsedData = JSON.parse(registeredUser);
          if (parsedData.displayName === displayName) {
            // Use full registered data if display names match
            userData = parsedData;
          }
        } catch (error) {
          console.error('Error parsing user data');
        }
      }
      
      // Demo login logic (in production, this would be an API call)
      if (displayName === 'DemoUser' && password === 'demo123') {
        if (rememberMe) {
          localStorage.setItem('loopifyUser', JSON.stringify(userData));
        }
        onLoginSuccess(displayName);
        localStorage.removeItem('registeredUser'); // Clear registration data after login
      } else if (displayName === password) {
        // Keep your original logic for testing
        if (rememberMe) {
          localStorage.setItem('loopifyUser', JSON.stringify(userData));
        }
        onLoginSuccess(displayName);
        localStorage.removeItem('registeredUser');
      } else {
        setError('Invalid display name or password. Please try again.');
      }
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic here
    alert(`Social login with ${provider} coming soon!`);
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="page-container">
        <div className="form-box">
          <div className="logo-container">
            <p className="logo-text">Loopify</p>
          </div>
          
          <h1>Log in to continue</h1>

          <div className="demo-hint">
            💡 Demo: Use display name "DemoUser" and password "demo123"
            <br />Or make display name and password the same for testing
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="displayName">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading}
              />
            </div>

            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="remember">Remember me</label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="forgot-password">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              alert('Password reset feature coming soon!');
            }}>
              Forgot your password?
            </a>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="social-login">
            <button 
              className="social-button"
              onClick={() => handleSocialLogin('Google')}
              disabled={isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <button 
              className="social-button"
              onClick={() => handleSocialLogin('Facebook')}
              disabled={isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>

          <div className="signup-link">
            Don't have an account? 
            <a href="#" onClick={(e) => {
              e.preventDefault();
              if (onRegisterClick) {
                onRegisterClick();
              } else {
                onBackClick();
              }
            }}>
              {' '}Sign up for free
            </a>
          </div>

          <p className="back-link" onClick={onBackClick}>
            ← Back to Home
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;