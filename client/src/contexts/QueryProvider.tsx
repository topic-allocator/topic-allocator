import { useMemo } from 'react';
import { useToast } from './toast/toastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const { pushToast } = useToast();

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            onError: async (res) => {
              let message = '';

              try {
                const json = await (res as Response)?.json?.();
                message = json.message;
              } catch (error) {
                message = 'INTERNAL_SERVER_ERROR';
              } finally {
                pushToast({
                  message: message,
                  type: 'error',
                });
              }
            },
          },
          mutations: {
            retry: false,
            onError: async (res) => {
              let message = '';

              try {
                const json = await (res as Response)?.json?.();
                message = json.message;
              } catch (error) {
                message = 'INTERNAL_SERVER_ERROR';
              } finally {
                pushToast({
                  message: message,
                  type: 'error',
                });
              }
            },
          },
        },
      }),
    [pushToast],
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
