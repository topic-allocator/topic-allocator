import { Session } from '@lti/server/src/utils';
import { createContext, useContext } from 'react';

export const SessionContext = createContext<Session | undefined>(undefined);

export function useSessionContext() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useLabelContext must be used within a LabelContextProvider');
  }
  return context;
}
