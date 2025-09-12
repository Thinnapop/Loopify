import React from 'react';

// Reusing the same styles for consistency
const pageStyles = `
body, html {
    margin: 0;
    padding: 0;
    background-color: #000; 
    font-family: sans-serif;
  }
  .page-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #121212;
    color: white;
    font-family: sans-serif;
  }
  .form-box {
    background-color: #282828;
    padding: 40px;
    border-radius: 10px;
    text-align: center;
    width: 320px;
  }
  .form-box h1 { margin-bottom: 20px; }
  .form-box input {
    width: 90%;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 5px;
    border: none;
    background-color: #333;
    color: white;
  }
  .form-box button {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: none;
    background-color: #1db954;
    color: white;
    font-weight: bold;
    cursor: pointer;
  }
  .back-link {
    margin-top: 20px;
    cursor: pointer;
    color: #b3b3b3;
    text-decoration: underline;
  }
`;

// 1. Define the props this component will accept.
interface LoginPageProps {
  onBackClick: () => void;
}

// 2. Tell the component to expect these props.
const LoginPage: React.FC<LoginPageProps> = ({ onBackClick }) => {
  return (
    <>
      <style>{pageStyles}</style>
      <div className="page-container">
        <div className="form-box">
          <h1>Login</h1>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button>Log In</button>
          {/* 3. Use the onBackClick prop here. */}
          <p className="back-link" onClick={onBackClick}>
            Back to Home
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

