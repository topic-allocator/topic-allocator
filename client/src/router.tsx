import { createBrowserRouter, redirect } from 'react-router-dom';
import Layout from './pages/layout';
import TopicList from './pages/topic-list';
import OwnTopics from './pages/own-topics';
import Preferences from './pages/preferences';

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
