import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import the Spatial UI design system
import './styles/index.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
