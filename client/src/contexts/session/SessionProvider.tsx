import { useQuery } from '@tanstack/react-query';
import { Session } from '@lti/server/src/utils';
import { SessionContext } from './sessionContext';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const {
    data: session,
    isLoading,
    isError,
  } = useQuery(['session'], async () => {
    return fetch('/api/session').then((response) => response.json() as Promise<Session>);
  });

  if (isLoading) {
    return null;
  }

  if (isError) {
    return <div>invalid session</div>;
  }

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
