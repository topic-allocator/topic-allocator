import { createBrowserRouter, redirect } from 'react-router-dom';
import Layout from './pages/Layout';
import Preferences from './pages/Preferences';
import TopicList from './pages/TopicList';
import OwnTopics from './pages/OwnTopics';

export const router = createBrowserRouter([
  {
    path: '/app',
    element: <Layout />,
    children: [
      {
        index: true,
        loader: () => redirect('/app/topic-list'),
      },
      {
        path: '/app/preferences',
        element: <Preferences />,
      },
      {
        path: '/app/topic-list',
        element: <TopicList />,
      },
      {
        path: '/app/own-topics',
        element: <OwnTopics />,
      },
    ],
  },
]);
