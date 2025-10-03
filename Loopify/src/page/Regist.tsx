import React, { useState } from 'react';

const pageStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body, html {
    margin: 0;
    padding: 0;
    background-color: #000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
  }
  
  .page-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(180deg, #1a1a1a 0%, #000000 100%);
    padding: 20px;
  }
  
  .form-box {
    background-color: #181818;
    padding: 48px;
    border-radius: 16px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  }
  
  .form-box h1 {
    color: #ffffff;
    font-size: 48px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 8px;
    letter-spacing: -1px;
  }
  
  .form-subtitle {
    color: #b3b3b3;
    font-size: 16px;
    text-align: center;
    margin-bottom: 40px;
    font-weight: 400;
  }
  
  .form-group {
    margin-bottom: 24px;
  }
  
  .form-label {
    display: block;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }
  
  .form-input,
  .form-select {
    width: 100%;
    padding: 14px 16px;
    background-color: #3e3e3e;
    border: 1px solid #3e3e3e;
    border-radius: 8px;
    color: #ffffff;
    font-size: 16px;
    transition: all 0.2s ease;
    outline: none;
  }
  
  .form-input::placeholder {
    color: #8e8e8e;
  }
  
  .form-input:hover,
  .form-select:hover {
    background-color: #4a4a4a;
    border-color: #4a4a4a;
  }
  
  .form-input:focus,
  .form-select:focus {
    background-color: #4a4a4a;
    border-color: #1db954;
    box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.1);
  }
  
  .form-select {
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23b3b3b3' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
  }
  
  .radio-group {
    display: flex;
    gap: 32px;
    margin-top: 8px;
  }
  
  .radio-option {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .radio-input {
    position: relative;
    width: 20px;
    height: 20px;
    margin-right: 8px;
    cursor: pointer;
    appearance: none;
    background-color: transparent;
    border: 2px solid #8e8e8e;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
  
  .radio-input:checked {
    border-color: #1db954;
    background-color: #1db954;
  }
  
  .radio-input:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background-color: #000;
    border-radius: 50%;
  }
  
  .radio-label {
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
    user-select: none;
  }
  
  .submit-button {
    width: 100%;
    padding: 16px;
    margin-top: 32px;
    background-color: #1db954;
    border: none;
    border-radius: 50px;
    color: #000000;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: #1ed760;
    transform: scale(1.02);
  }
  
  .submit-button:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  .submit-button:disabled {
    background-color: #3e3e3e;
    color: #8e8e8e;
    cursor: not-allowed;
    transform: none;
  }
  
  .divider {
    width: 100%;
    height: 1px;
    background-color: #3e3e3e;
    margin: 32px 0;
  }
  
  .login-section {
    text-align: center;
    color: #b3b3b3;
    font-size: 16px;
  }
  
  .login-link {
    color: #1db954;
    text-decoration: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .login-link:hover {
    color: #1ed760;
    text-decoration: underline;
  }
  
  .back-link {
    text-align: center;
    margin-top: 24px;
    color: #b3b3b3;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .back-link:hover {
    color: #ffffff;
  }
  
  .error-message {
    background-color: rgba(244, 67, 54, 0.1);
    border: 1px solid #f44336;
    border-radius: 8px;
    padding: 12px;
    margin-top: 20px;
    color: #f44336;
    font-size: 14px;
    text-align: center;
    animation: shake 0.5s;
  }
  
  .success-message {
    background-color: rgba(29, 185, 84, 0.1);
    border: 1px solid #1db954;
    border-radius: 8px;
    padding: 12px;
    margin-top: 20px;
    color: #1db954;
    font-size: 14px;
    text-align: center;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;

// Props interface
interface RegistPageProps {
  onBackClick?: () => void;
  onRegistrationSuccess?: () => void;
}

// Form data interface
interface FormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  sex: string;
  language: string;
}

const API_URL = 'http://localhost:5001/api';

export default function RegistPage({ onBackClick = () => {}, onRegistrationSuccess = () => {} }: RegistPageProps) {
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    sex: '',
    language: 'en'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Country list
  const countries = [
    'Thailand',
    'United States',
    'United Kingdom',
    'Japan',
    'South Korea',
    'Singapore',
    'Malaysia',
    'Indonesia',
    'Philippines',
    'Vietnam',
    'Australia',
    'Canada',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Netherlands',
    'Sweden',
    'Norway',
    'Denmark',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    // Check all required fields
    if (!formData.displayName.trim()) {
      setError('Please enter your display name');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.country) {
      setError('Please select your country');
      return false;
    }

    if (!formData.sex) {
      setError('Please select your sex');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
  
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password,
          country: formData.country,
          language: formData.language,
          sex: formData.sex  // Include sex field
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setSuccess('Account created successfully!');
        
        // Store auth token AND full user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('loopifyUser', JSON.stringify(data.user));
        
        console.log('User registered with data:', data.user);
        
        // Call onRegistrationSuccess immediately to trigger login
        setTimeout(() => {
          onRegistrationSuccess();
        }, 1500);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Cannot connect to server. Please make sure the backend server is running on http://localhost:5001');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRegistrationSuccess();
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="page-container">
        <div className="form-box">
          <h1>Join Loopify</h1>
          <p className="form-subtitle">Music that moves with you</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Display Name *</label>
              <input
                type="text"
                name="displayName"
                className="form-input"
                placeholder="Enter your display name"
                value={formData.displayName}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country *</label>
              <select
                name="country"
                className="form-select"
                value={formData.country}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              >
                <option value="">Select your country</option>
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sex *</label>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="male"
                    name="sex"
                    value="male"
                    className="radio-input"
                    checked={formData.sex === 'male'}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  <label htmlFor="male" className="radio-label">Male</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="female"
                    name="sex"
                    value="female"
                    className="radio-input"
                    checked={formData.sex === 'female'}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="female" className="radio-label">Female</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="other"
                    name="sex"
                    value="other"
                    className="radio-input"
                    checked={formData.sex === 'other'}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="other" className="radio-label">Other</label>
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="divider"></div>

          <div className="login-section">
            Already have an account? {' '}
            <a href="#" className="login-link" onClick={handleLoginClick}>
              Log in
            </a>
          </div>

          <div className="back-link" onClick={onBackClick}>
            ← Back to Home
          </div>
        </div>
      </div>
    </>
  );
}