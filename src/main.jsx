import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import AuroraBackground from './Components/ui/aurora-background.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuroraBackground>

  <React.StrictMode>
    <App />
  </React.StrictMode>
  </AuroraBackground>
);