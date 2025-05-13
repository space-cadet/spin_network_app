import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import routes from './routes';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/graph" replace />} />
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
    </Routes>
  );
};

export default App;