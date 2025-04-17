import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App.tsx';
import { store, persistor } from './store';
// Import simulation logger file logging enabler
import { enableDefaultLoggerFileLogging } from '../lib/utils/simulationLogger';
// Import BrowserFS initialization
import { initializeBrowserFS, testBrowserFS } from './utils/browserFSConfig';

// Import PrimeReact core functionality (without global styling)
import 'primeicons/primeicons.css'; // Only icons - required for icons to display

// Import our scoped CSS for PrimeReact components
import './styles/primereact-scoped.css';
import './styles/index.css';
// Import direct fixes for PrimeReact overlays
import './styles/primereact-fixes.css';

// Initialize BrowserFS first, then enable file logging
async function initializeApp() {
  // Initialize file system in browser environment
  if (typeof window !== 'undefined') {
    try {
      await initializeBrowserFS();
      testBrowserFS(); // Verify BrowserFS is working correctly
      console.log('File system initialized. Enabling simulation logger file logging.');
      enableDefaultLoggerFileLogging();
    } catch (err) {
      console.error('Failed to initialize file system:', err);
      // Continue app initialization even if file system fails
    }
  } else {
    // In non-browser environment, just enable file logging directly
    enableDefaultLoggerFileLogging();
  }

  // Import test utility in development mode
  if (import.meta.env.DEV) {
    import('./utils/testPersistence');
  }

  // Initialize React app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </React.StrictMode>,
  );
}

// Simple loading component to show while persistor is loading
const Loading = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-700">Loading your network...</p>
    </div>
  </div>
);

// Start the application
initializeApp();
