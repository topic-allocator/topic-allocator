import { useQuery } from '@tanstack/react-query';
import type { Session } from '@lti/server/src/lib/utils';
import { SessionContext } from '@/contexts/session/session-context';
import { fetcher } from '@/utils';

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: session,
    isLoading,
    isError,
  } = useQuery(['session'], async () => {
    return fetcher<Session>('/api/session');
  });

  if (isLoading) {
    return <div>Validating session...</div>;
  }

  if (isError) {
    return <div>Invalid session</div>;
  }

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
