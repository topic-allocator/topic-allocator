export type Locales = 'hu' | 'en';

export const labels = {
  PREFERENCE_LIST: {
    hu: 'Preferencia lista',
    en: 'Preference list',
  },
  TOPIC_LIST: {
    hu: 'Témalista',
    en: 'Topic list',
  },
  OWN_TOPICS: {
    hu: 'Saját témák',
    en: 'Own topics',
  },
  PREFERENCES: {
    hu: 'Preferenciák',
    en: 'Preferences',
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
  RANK: {
    hu: 'Rang',
    en: 'Rank',
  },
  TITLE: {
    hu: 'Cím',
    en: 'Title',
  },
  DESCRIPTION: {
    hu: 'Leírás',
    en: 'Description',
  },
  TYPE: {
    hu: 'Típus',
    en: 'Type',
  },
  INSTRUCTOR: {
    hu: 'Oktató',
    en: 'Instructor',
  },
  SAVE: {
    hu: 'Mentés',
    en: 'Save',
  },
  SAVING: {
    hu: 'Mentés',
    en: 'Saving',
  },
  SAVED: {
    hu: 'Mentve',
    en: 'Saved',
  },
} satisfies Record<string, Record<Locales, string>>;
