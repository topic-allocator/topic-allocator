import { HttpRequest } from '@azure/functions';
import { parseCookie } from './lib/parseCookie';

export const localeOptions = ['hu', 'en'] as const;
export type Locale = (typeof localeOptions)[number];

export const labels = {
  CONFIRM: {
    hu: 'Rendben',
    en: 'Confirm',
  },
  SELECT: {
    hu: 'Válasszon',
    en: 'Select',
  },
  SEARCH: {
    hu: 'Keresés',
    en: 'Search',
  },
  CREATE: {
    hu: 'Létrehozás',
    en: 'Create',
  },
  LOADING: {
    hu: 'Betöltés',
    en: 'Loading',
  },
  CANCEL: {
    hu: 'Mégse',
    en: 'Cancel',
  },
  UPDATE: {
    hu: 'Frissítés',
    en: 'Update',
  },
  ERROR: {
    hu: 'Hiba',
    en: 'Error',
  },
  PREFERENCE_LIST: {
    hu: 'Preferencia lista',
    en: 'Preference list',
  },
  ADD_TO_PREFERENCE_LIST: {
    hu: 'Preferencia listához adás',
    en: 'Add to preference list',
  },
  REMOVE_FROM_PREFERENCE_LIST: {
    hu: 'Eltávolítás a preferencia listából',
    en: 'Remove from preference list',
  },
  CAPACITY: {
    hu: 'Kapacitás',
    en: 'Capacity',
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
  EDIT_TOPIC: {
    hu: 'Téma szerkesztése',
    en: 'Edit topic',
  },
  DELETE_TOPIC: {
    hu: 'Téma törlése',
    en: 'Delete topic',
  },
  DELETE_TOPIC_CONFIRM: {
    hu: 'Biztosan törli a témát?',
    en: 'Are you sure you want to delete this topic?',
  },
  CREATE_NEW_TOPIC: {
    hu: 'Új téma létrehozása',
    en: 'Create new topic',
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
  ASSIGNED_STUDENTS: {
    hu: 'Beosztott hallgatók',
    en: 'Assigned students',
  },
  NO_ASSIGNED_STUDENTS: {
    hu: 'Nincsenek beosztott hallgatók',
    en: 'No assigned students',
  },
  TOPIC_PREFERENCE_CREATED: {
    hu: 'Téma preferencia listához adva',
    en: 'Topic added to preference list',
  },
  TOPIC_PREFERENCES_UPDATED: {
    hu: 'Preferencia lista frissítve',
    en: 'Preference list updated',
  },
  TOPIC_PREFERENCE_DELETED: {
    hu: 'Téma preferencia törölve',
    en: 'Topic deleted from preference list',
  },
  COURSE_PREFERENCE_CREATED: {
    hu: 'Súly létrehozva',
    en: 'Weight created',
  },
  COURSE_PREFERENCE_DELETED: {
    hu: 'Súly törölve',
    en: 'Weight deleted',
  },
  ANNOUNCED_TOPICS: {
    hu: 'Kihirdetett témák',
    en: 'Announced topics',
  },
  NO_RECORDS_FOUND: {
    hu: 'Nincsenek találatok',
    en: 'No records found',
  },
  ALL: {
    hu: 'Összes',
    en: 'All',
  },
  SELECT_INSTRUCTOR: {
    hu: 'Válassza ki az oktatót!',
    en: 'Select an instructor!',
  },
  NORMAL: {
    hu: 'Normál',
    en: 'Normal',
  },
  RESEARCH: {
    hu: 'Kutatás',
    en: 'Research',
  },
  TDK: {
    hu: 'TDK',
    en: 'TDK',
  },
  INTERNSHIP: {
    hu: 'Szakmai gyakorlat',
    en: 'Internship',
  },
  CLEAR_FILTERS: {
    hu: 'Szűrők törlése',
    en: 'Clear filters',
  },
  DETAILS: {
    hu: 'Részletek',
    en: 'Details',
  },
  CLOSE: {
    hu: 'Bezár',
    en: 'Close',
  },
  AT_LEAST_TEN_PREFERENCES_ARE_REQUIRED: {
    hu: 'Legalább 10 preferencia megadása szükséges',
    en: 'At least 10 preferences are required',
  },
  MOVE_UP: {
    hu: 'Mozgatás fel',
    en: 'Move up',
  },
  MOVE_DOWN: {
    hu: 'Mozgatás le',
    en: 'Move down',
  },
  WEIGHT: {
    hu: 'Súly',
    en: 'Weight',
  },
  WEIGHTS: {
    hu: 'Súlyok',
    en: 'Weights',
  },
  STUDENTS: {
    hu: 'Hallgatók',
    en: 'Students',
  },
  EDIT: {
    hu: 'Szerkesztés',
    en: 'Edit',
  },
  DELETE: {
    hu: 'Törlés',
    en: 'Delete',
  },
  EMAIL: {
    hu: 'Email',
    en: 'Email',
  },
  NAME: {
    hu: 'Név',
    en: 'Name',
  },
  TOPIC_TITLE: {
    hu: 'Téma címe',
    en: 'Topic title',
  },
  SELECT_TOPIC_TYPE: {
    hu: 'Válassza ki a téma típusát!',
    en: 'Select a topic type!',
  },
  INTERNAL_SERVER_ERROR: {
    hu: 'Szerver hiba',
    en: 'Internal server error',
  },
  UNKNOWN_FILE_TYPE: {
    hu: 'Ismeretlen fájltípus',
    en: 'Unknown file type',
  },
  UNAUTHORIZED_REQUEST: {
    hu: 'Hozzáférés megtagadva',
    en: 'Unauthorized request',
  },
  UNPROCESSABLE_ENTITY: {
    hu: 'Hibás kérés',
    en: 'Unprocessable request',
  },
  PREFERENCE_NOT_FOUND: {
    hu: 'A preferencia nem található',
    en: 'Preference not found',
  },
  DUPLICATE_RANKS: {
    hu: 'Duplikált rangok',
    en: 'Duplicate ranks',
  },
  TOPIC_PREFERENCE_ALREADY_EXISTS: {
    hu: 'A téma már szerepel a preferencia listában',
    en: 'Topic already exists in preference list',
  },
  TOPIC_ALREADY_EXISTS: {
    hu: 'A téma már létezik',
    en: 'Topic already exists',
  },
  USER_NOT_FOUND: {
    hu: 'Felhasználó nem található',
    en: 'User not found',
  },
  CAPACITY_CAN_NOT_BE_LOWER_THAN: {
    hu: 'A kapacitás nem lehet kisebb, mint ${}',
    en: 'Capacity can not be lower than ${}',
  },
  TOPIC_NOT_FOUND: {
    hu: 'A téma nem található',
    en: 'Topic not found',
  },
  ENTER_TOPIC_TITLE: {
    hu: 'Adja meg a téma címét',
    en: 'Enter topic title',
  },
  TITLE_REQUIRED: {
    hu: 'Cím megadása kötelező',
    en: 'Title is required',
  },
  TYPE_REQUIRED: {
    hu: 'Típus megadása kötelező',
    en: 'Type is required',
  },
  CAPACITY_REQUIRED: {
    hu: 'Kapacitás megadása kötelező',
    en: 'Capacity is required',
  },
  ENTER_TOPIC_DESCRIPTION: {
    hu: 'Adja meg a téma leírását',
    en: 'Enter topic description',
  },
  DESCRIPTION_REQUIRED: {
    hu: 'Leírás megadása kötelező',
    en: 'Description is required',
  },
  COURSE: {
    hu: 'Tantárgy',
    en: 'Course',
  },
  CREDITS: {
    hu: 'Kreditek',
    en: 'Credits',
  },
  SOLVER: {
    hu: 'Solver',
    en: 'Solver',
  },
  ASSIGNMENTS: {
    hu: 'Beosztások',
    en: 'Assignments',
  },
  ASSIGNED_TOPIC: {
    hu: 'Kiosztott téma',
    en: 'Assigned topic',
  },
  ADMIN: {
    hu: 'Admin',
    en: 'Admin',
  },
  SOLVER_FINISHED: {
    hu: 'Solver végzett',
    en: 'Solver finished',
  },
  STUDENT_UPDATED_SUCCESFULLY: {
    hu: 'Hallgató sikeresen frissítve',
    en: 'Student updated successfully',
  },
  TOPIC_FULL: {
    hu: 'A téma betelt',
    en: 'Topic is full',
  },
  YOU_HAVE_BEEN_ASSIGNED_TO_TOPIC: {
    hu: 'A következő témára került beosztásra',
    en: 'You have been assigned to the following topic',
  },
  LANGUAGE: {
    hu: 'Nyelv',
    en: 'Language',
  },
  CREATED_AT: {
    hu: 'Létrehozva',
    en: 'Created at',
  },
  UPDATED_AT: {
    hu: 'Frissítve',
    en: 'Updated at',
  },
  RESEARCH_QUESTION: {
    hu: 'Kutatási kérdés',
    en: 'Research question',
  },
  ENTER_RESEARCH_QUESTION: {
    hu: 'Adja meg a kutatási kérdést',
    en: 'Enter research question',
  },
  RECOMMENDED_LITERATURE: {
    hu: 'Ajánlott irodalom',
    en: 'Recommended literature',
  },
  ENTER_RECOMMENDED_LITERATURE: {
    hu: 'Adja meg az ajánlott irodalmat',
    en: 'Enter recommended literature',
  },
  NOT_SPECIFIED: {
    hu: 'Nincs megadva',
    en: 'Not specified',
  },
} satisfies Record<string, Record<Locale, string>>;

export type Labels = typeof labels;

export function getLabel(key: keyof Labels, request: HttpRequest) {
  const cookieString = request.headers.get('Cookie');
  const { locale } = parseCookie(cookieString ?? '');

  if (localeOptions.includes(locale as Locale)) {
    return labels[key][locale as Locale];
  }

  return labels[key]['en'];
}
