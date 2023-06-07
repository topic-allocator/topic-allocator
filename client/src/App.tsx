import LabelProvider from './contexts/labels/LabelProvider';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import SessionProvider from './contexts/session/SessionProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
        onError: (error) => {
          console.log(error, 'asd');
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <LabelProvider>
          <RouterProvider router={router} />
        </LabelProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
