import React from 'react';
import { RouteObject } from 'react-router-dom';
import GraphPage from '../pages/GraphPage';
import QuantumPage from '../pages/QuantumPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: React.createElement(GraphPage),
  },
  {
    path: '/quantum',
    element: React.createElement(QuantumPage),
  },
];

export default routes;