import { useState } from 'react';
import { LabelContext, Locales, buildLabels } from './labelContext.ts';
import { useSession } from '../session/sessionContext.ts';

export default function LabelProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();

  const [locale, setLocale] = useState<Locales>(session.locale);

  return (
    <LabelContext.Provider
      value={{
        labels: buildLabels(locale),
        locale: locale,
        setLocale,
      }}
    >
      {children}
    </LabelContext.Provider>
  );
}
