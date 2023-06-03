import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import Layout from './pages/Layout';
import Preferences from './pages/Preferences';
import List from './pages/List';
import { useState } from 'react';
import { LabelContext, Locales, buildLabels } from './labels';
import { useQuery } from '@tanstack/react-query';
import { Session } from '@lti/server/src/utils';

export default function App() {
  const [locale, setLocale] = useState<Locales>();

  const { isLoading, isError } = useQuery(
    ['session'],
    async () => {
      return fetch('/api/session').then((response) => response.json() as Promise<Session>);
    },
    {
      onSuccess: (session) => {
        if (!locale) {
          setLocale(session.locale);
        }
      },
    },
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }

  const router = createBrowserRouter([
    {
      path: '/app',
      element: <Layout setLocale={setLocale} />,
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
          element: <List />,
        },
      ],
    },
  ]);

  return (
    <LabelContext.Provider value={buildLabels(locale ?? 'hu')}>
      <RouterProvider router={router} />
    </LabelContext.Provider>
  );
}
