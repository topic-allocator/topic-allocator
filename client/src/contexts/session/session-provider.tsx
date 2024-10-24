import { SessionContext } from '@/contexts/session/session-context';
import { trpc } from '@/utils';

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending, isError } = trpc.session.useQuery();

  if (isPending) {
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
