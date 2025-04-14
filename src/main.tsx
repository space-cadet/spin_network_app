import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App.tsx';
import { store, persistor } from './store';

// Import PrimeReact core functionality (without global styling)
import 'primeicons/primeicons.css'; // Only icons - required for icons to display

// Import our scoped CSS for PrimeReact components
import './styles/primereact-scoped.css';
import './styles/index.css';
// Import direct fixes for PrimeReact overlays
import './styles/primereact-fixes.css';

// Import test utility in development mode
if (import.meta.env.DEV) {
  import('./utils/testPersistence');
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);
