import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Custom render method that includes common providers
function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter>
        {children}
      </MemoryRouter>
    ),
    ...options,
  });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };