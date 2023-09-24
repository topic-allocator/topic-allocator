import { Navigate, createBrowserRouter, redirect } from 'react-router-dom';
import Layout from './pages/layout';
import TopicList from './pages/topic-list';
import OwnTopics from './pages/own-topics';
import Preferences from './pages/preferences';
import { useSession } from './contexts/session/sessionContext';
import { ReactNode } from 'react';

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
        element: (
          <Guard role="isStudent">
            <Preferences />
          </Guard>
        ),
      },
      {
        path: '/app/topic-list',
        element: <TopicList />,
      },
      {
        path: '/app/own-topics',
        element: (
          <Guard role="isInstructor">
            <OwnTopics />
          </Guard>
        ),
      },
    ],
  },
]);

// eslint-disable-next-line react-refresh/only-export-components
function Guard({
  children,
  role,
}: {
  children: ReactNode;
  role: 'isInstructor' | 'isStudent';
}) {
  const session = useSession();

  if (!session[role]) {
    return <Navigate to="/app/topic-list" replace />;
  }

  return children;
}
