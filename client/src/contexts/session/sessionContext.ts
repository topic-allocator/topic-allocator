import { Session } from '@lti/server/src/utils';
import { createContext, useContext } from 'react';

export const SessionContext = createContext<Session | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
