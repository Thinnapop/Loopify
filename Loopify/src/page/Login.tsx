import React, { useState } from 'react';

const pageStyles = `
  /* (Styles from your previous file) */
  body, html {
    margin: 0;
    padding: 0;
    background-color: #000; 
    font-family: sans-serif;
  }
  .page-container { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #121212; color: white; font-family: sans-serif; }
  .form-box { background-color: #282828; padding: 40px; border-radius: 10px; text-align: center; width: 320px; }
  .form-box h1 { margin-bottom: 20px; }
  .form-box input { width: 90%; padding: 10px; margin-bottom: 15px; border-radius: 5px; border: none; background-color: #333; color: white; }
  .form-box button { width: 100%; padding: 10px; border-radius: 5px; border: none; background-color: #1db954; color: white; font-weight: bold; cursor: pointer; }
  .back-link { margin-top: 20px; cursor: pointer; color: #b3b3b3; text-decoration: underline; }
  .error-message { color: #f44336; margin-bottom: 15px; font-size: 14px; }
`;

interface LoginPageProps {
  onBackClick: () => void;
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBackClick, onLoginSuccess }) => {
  // 1. Add state to store what the user types in the input fields.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 2. This function handles the login logic.
  const handleLogin = () => {
    setError(''); // Clear any previous errors

    // --- THIS IS WHERE THE BACKEND LOGIC WILL GO ---
    // For now, we will simulate it with a simple check.
    // In the future, you will replace this with an API call to your backend.
    if (email === 'user@loopify.com' && password === 'password123') {
      // If the details are correct, we call the onLoginSuccess function
      // passed down from App.tsx, which changes the page.
      onLoginSuccess();
    } else {
      // If the details are wrong, we show an error message.
      setError('Invalid email or password. Please try again.');
    }
    // -------------------------------------------------
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="page-container">
        <div className="form-box">
          <h1>Login</h1>
          {/* 3. Connect the input fields to our state. */}
          <input 
            type="email" 
            placeholder="Email ex.(user@loopify.com)" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password ex.(password123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Show the error message if it exists */}
          {error && <p className="error-message">{error}</p>}

          {/* 4. The button now calls our new handleLogin function. */}
          <button onClick={handleLogin}>Log In</button>
          
          <p className="back-link" onClick={onBackClick}>
            Back to Home
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

