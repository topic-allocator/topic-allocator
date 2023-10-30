import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import { labels, Locale } from '@/labels';

type LabelContextType = {
  locale: Locale;
  labels: Record<keyof typeof labels, string>;
  setLocale: Dispatch<SetStateAction<Locale>>;
};

export const LabelContext = createContext<LabelContextType | undefined>(
  undefined,
);

export function useLabel() {
  const context = useContext(LabelContext);

  if (!context) {
    throw new Error('useLabel must be used within a LabelProvider');
  }
  return context;
}

export function buildLabels(locale: Locale) {
  return Object.entries(labels).reduce(
    (acc, [key, value]) => {
      acc[key as keyof typeof labels] = value[locale];
      return acc;
    },
    {} as Record<keyof typeof labels, string>,
  );
}
