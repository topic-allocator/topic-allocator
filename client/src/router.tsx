import { Navigate, createBrowserRouter, redirect } from 'react-router-dom';
import Layout from '@/pages/layout';
import TopicList from '@/pages/topic-list';
import Preferences from '@/pages/preferences';
import { useSession } from '@/contexts/session/session-context';
import { ReactNode } from 'react';
import InstructorLayout from '@/pages/instructor/layout';
import OwnTopics from '@/pages/instructor/own-topics';
import AssignedStudents from '@/pages/instructor/assigned-students';

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
        path: '/app/instructor',
        element: (
          <Guard role="isInstructor">
            <InstructorLayout />
          </Guard>
        ),
        children: [
          {
            index: true,
            loader: () => redirect('/app/instructor/own-topics'),
          },
          {
            path: '/app/instructor/own-topics',
            element: <OwnTopics />,
          },
          {
            path: '/app/instructor/assigned-students',
            element: <AssignedStudents />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/app/topic-list" replace />,
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
