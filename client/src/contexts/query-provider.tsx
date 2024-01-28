import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToast } from '@/contexts/toast/toast-context';
import { useLabels } from '@/contexts/labels/label-context';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pushToast } = useToast();
  const { labels } = useLabels();

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
                message = labels.INTERNAL_SERVER_ERROR;
                console.error(error, labels.INTERNAL_SERVER_ERROR);
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
                message = labels.INTERNAL_SERVER_ERROR;
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
    [pushToast, labels],
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
