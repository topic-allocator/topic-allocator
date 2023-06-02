import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import Layout from './pages/Layout.tsx';
import Preferences from './pages/Preferences.tsx';
import List from './pages/List.tsx';

const router = createBrowserRouter([
  {
    path: '/app',
    element: <Layout />,
    children: [
      {
        index: true,
        loader: () => redirect('/app/preferences'),
      },
      {
        path: '/app/preferences',
        element: <Preferences />,
      },
      {
        path: '/app/list',
        element: <List />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
