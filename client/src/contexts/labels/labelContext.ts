import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import { Locales } from '@/labels';
import { labels } from '@/labels';

type LabelContextType = {
  locale: Locales;
  labels: Record<keyof typeof labels, string>;
  setLocale: Dispatch<SetStateAction<Locales>>;
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

export function buildLabels(locale: Locales) {
  return Object.entries(labels).reduce(
    (acc, [key, value]) => {
      acc[key as keyof typeof labels] = value[locale];
      return acc;
    },
    {} as Record<keyof typeof labels, string>,
  );
}
