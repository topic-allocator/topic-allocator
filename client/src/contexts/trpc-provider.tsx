import { TRPCClientError, httpBatchLink, loggerLink } from '@trpc/client';
import { useMemo } from 'react';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useToast } from '@/contexts/toast/toast-context';
import { useLabels } from '@/contexts/labels/label-context';
import { trpc } from '@/utils';

const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: '/trpc',
    }),
  ],
});

export default function TrpcProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pushToast } = useToast();
  const { labels } = useLabels();

  const queryClient = useMemo(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            let httpStatus;
            if (error instanceof TRPCClientError) {
              httpStatus = error.data.httpStatus;
            }

            let message = error.message ?? labels.INTERNAL_SERVER_ERROR;
            if (httpStatus) {
              message = `${httpStatus}: ${message}`;
            }

            pushToast({
              message,
              type: 'error',
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            let httpStatus;
            if (error instanceof TRPCClientError) {
              httpStatus = error.data.httpStatus;
            }

            let message = error.message ?? labels.INTERNAL_SERVER_ERROR;
            if (httpStatus) {
              message = `${httpStatus}: ${message}`;
            }

            pushToast({
              message,
              type: 'error',
            });
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
    [pushToast, labels],
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
