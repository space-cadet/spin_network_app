import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AppStateProvider } from '@spin-network/template-core/state';
import { store } from './store';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Router>
      <Provider store={store}>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </Provider>
    </Router>
  </React.StrictMode>
);