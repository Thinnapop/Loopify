import React from 'react';
import ReactDOM from 'react-dom/client';
// The import path now includes the .tsx extension to be more explicit.
import App from './App.tsx'; 

// This is the "construction crew" that builds your app.
// It finds the <div id="root"></div> in your index.html file...
const rootElement = document.getElementById('root');

if (rootElement) {
  // ...and tells React to build your entire <App> component inside of it.
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Make sure your index.html has a div with id='root'.");
}

