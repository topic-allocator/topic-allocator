import { useState } from 'react';
import { LabelContext } from '@/contexts/labels/label-context';
import { type Labels, type Locale, labels } from '@lti/server/src/labels';
import { parseCookie } from '@lti/server/src/lib/parseCookie';

export default function LabelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const parsedCookie = parseCookie(document.cookie);

  const preferredLocale = parsedCookie['locale'] as Locale | undefined;
  const [locale, setLocale] = useState<Locale>(preferredLocale ?? 'en');

  return (
    <LabelContext.Provider
      value={{
        labels: buildLabels(labels, locale),
        locale: locale,
        setLocale: (locale) => {
          document.cookie = `locale=${locale}`;
          setLocale(locale);
        },
      }}
    >
      {children}
    </LabelContext.Provider>
  );
}

function buildLabels(labels: Labels, locale: Locale) {
  return Object.entries(labels).reduce(
    (acc, [key, value]) => {
      acc[key as keyof typeof labels] = value[locale];
      return acc;
    },
    {} as Record<keyof typeof labels, string>,
  );
}
