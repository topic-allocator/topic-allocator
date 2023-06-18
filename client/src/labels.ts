export type Locales = 'hu' | 'en';

export const labels = {
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
  TOPIC_DELETED_SUCCESSFULLY: {
    hu: 'Téma sikeresen törölve',
    en: 'Topic deleted successfully',
  },
  TOPIC_CREATED_SUCCESSFULLY: {
    hu: 'Téma sikeresen létrehozva',
    en: 'Topic created successfully',
  },
  TOPIC_UPDATED_SUCCESSFULLY: {
    hu: 'Téma sikeresen frissítve',
    en: 'Topic updated successfully',
  },
} satisfies Record<string, Record<Locales, string>>;
