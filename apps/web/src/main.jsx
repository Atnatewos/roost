// apps/web/src/main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global styles - loaded once at the application root
import './styles/global.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/pages.css';

/**
 * ROOST Application Entry Point.
 * Mounts the React application to the DOM.
 * StrictMode is enabled for development warnings.
 * All styles are imported here for global availability.
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. Ensure there is a <div id="root"></div> in your index.html.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);