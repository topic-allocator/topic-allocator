import { createContext } from 'react';

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
} satisfies Record<string, Record<Locales, string>>;

export function buildLabels(locale: Locales) {
  return Object.entries(labels).reduce((acc, [key, value]) => {
    acc[key as keyof typeof labels] = value[locale];
    return acc;
  }, {} as Record<keyof typeof labels, string>);
}

export const LabelContext = createContext({} as ReturnType<typeof buildLabels>);
