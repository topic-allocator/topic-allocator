import { useState } from 'react';
import { LabelContext, buildLabels } from '@/contexts/labels/labelContext';
import { useSession } from '@/contexts/session/sessionContext.ts';
import { Locale } from '@/labels.ts';

export default function LabelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();

  const preferredLocale = localStorage.getItem('locale') as Locale | undefined;
  const [locale, setLocale] = useState<Locale>(
    preferredLocale ?? session.locale,
  );

  return (
    <LabelContext.Provider
      value={{
        labels: buildLabels(locale),
        locale: locale,
        setLocale: (locale) => {
          localStorage.setItem('locale', locale as string);
          setLocale(locale);
        },
      }}
    >
      {children}
    </LabelContext.Provider>
  );
}
