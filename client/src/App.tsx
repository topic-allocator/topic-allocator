import LabelProvider from './contexts/labels/LabelProvider';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import SessionProvider from './contexts/session/SessionProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToast } from './contexts/toast/toastContext';

export default function App() {
  const { pushToast } = useToast();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
        onError: async (res) => {
          const json = await (res as Response)?.json?.();
          const errorCode = json?.errorCode ?? 'INTERNAL_SERVER_ERROR';
          pushToast({
            message: errorCode,
            type: 'error',
          });
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
