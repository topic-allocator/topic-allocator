import { Dispatch, SetStateAction, createContext, useContext } from 'react';

export type Locales = 'hu' | 'en';
const labels = {
  TOPIC_PREFERENCES: {
    hu: 'Téma preferenciák',
    en: 'Topic preferences',
  },
  TOPIC_LIST: {
    hu: 'Témalista',
    en: 'Topic list',
  },
  OWN_TOPICS: {
    hu: 'Saját témák',
    en: 'Own topics',
  },
} satisfies Record<string, Record<Locales, string>>;

type LabelContextType = {
  locale: Locales;
  labels: Record<keyof typeof labels, string>;
  setLocale: Dispatch<SetStateAction<Locales>>;
};

export const LabelContext = createContext<LabelContextType | undefined>(undefined);

export function useLabel() {
  const context = useContext(LabelContext);

  if (!context) {
    throw new Error('useLabel must be used within a LabelProvider');
  }
  return context;
}

export function buildLabels(locale: Locales) {
  return Object.entries(labels).reduce((acc, [key, value]) => {
    acc[key as keyof typeof labels] = value[locale];
    return acc;
  }, {} as Record<keyof typeof labels, string>);
}
