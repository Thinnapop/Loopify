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

  .success-message {
    color: #4caf50;
    margin-bottom: 15px;
    font-size: 14px;
    text-align: center;
    padding: 10px;
    background-color: rgba(76, 175, 80, 0.1);
    border-radius: 4px;
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

  .test-accounts {
    background-color: rgba(29, 185, 84, 0.05);
    border: 1px solid rgba(29, 185, 84, 0.3);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 20px;
    font-size: 12px;
    color: #b3b3b3;
  }

  .test-accounts h4 {
    margin: 0 0 8px 0;
    color: #1ed760;
    font-size: 13px;
  }

  .test-accounts p {
    margin: 4px 0;
  }
`;
interface UserData {
  userId?: string;
  displayName: string;
  email?: string;
  country?: string;
  sex?: string;
  language?: string;

}
interface LoginPageProps {
  onBackClick: () => void;
  onLoginSuccess: (userData: UserData) => void;
  onRegisterClick?: () => void;
}

const API_URL = 'http://localhost:5001/api';

const LoginPage: React.FC<LoginPageProps> = ({ onBackClick, onLoginSuccess, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user just registered
  useEffect(() => {
    const registeredMessage = localStorage.getItem('registrationSuccess');
    if (registeredMessage) {
      setSuccess(registeredMessage);
      localStorage.removeItem('registrationSuccess');
      setTimeout(() => setSuccess(''), 5000);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      // First try real backend API
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('loopifyUser', JSON.stringify(data.user));
        
        
        if (rememberMe) {
          localStorage.setItem('rememberUser', 'true');
        }

        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to demo mode if backend is not running
      if (email === 'demo@loopify.com' && password === 'demo123') {
        const demoUser = {
          userId: 'demo_user',
          displayName: 'Demo User',
          email: 'demo@loopify.com'
        };
        
        localStorage.setItem('loopifyUser', JSON.stringify(demoUser));
        onLoginSuccess(demoUser);
      } else {
        setError('Cannot connect to server. Please ensure the backend is running on port 5000.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    setError('Social login coming soon!');
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

          {success && <div className="success-message">{success}</div>}

          <div className="test-accounts">
            <h4>Test Accounts (Click to fill):</h4>
            <p onClick={() => handleQuickLogin('demo@loopify.com', 'demo123')} style={{ cursor: 'pointer', color: '#1db954' }}>
              Demo: demo@loopify.com / demo123
            </p>
            <p style={{ fontSize: '11px', marginTop: '8px' }}>
              Or register a new account with the Sign Up button below
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading}
                required
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
                required
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
              setError('Password reset feature coming soon!');
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