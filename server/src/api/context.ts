import { InvocationContext } from '@azure/functions';
import { db } from '../db';
import { Session, extractSession } from '../lib/utils';
import { CreateContextOptions } from './trpc-adapter';
import { parseCookie } from '../lib/parseCookie';
import { labels, Labels, Locale, localeOptions } from '../labels';

export type TRPCContext = {
  db: typeof db;
  session: Session | undefined;
  locale: Locale;
  azureContext: InvocationContext;
  log: InvocationContext['log'];
  error: InvocationContext['error'];
  warn: InvocationContext['warn'];
  info: InvocationContext['info'];
  getLabel: (key: keyof Labels) => string;
};

export function createContext({
  request,
  context,
  path,
}: CreateContextOptions): TRPCContext {
  let session: Session | undefined;

  try {
    session = extractSession(request);
  } catch (error) {
    context.error(error);
    session = undefined;
  }

  function customLogger(
    path: string,
    severity: 'log' | 'error' | 'warn' | 'info',
  ) {
    return (...args: unknown[]) => {
      context[severity]({
        path,
        severity,
        message: args.join(' '),
      });
    };
  }

  const cookieString = request.headers.get('Cookie');
  const { locale: localeCookie } = parseCookie(cookieString ?? '');

  let locale: Locale = 'en';
  if (localeOptions.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  }

  return {
    db,
    session,
    azureContext: context,
    locale,
    log: customLogger(path, 'log'),
    error: customLogger(path, 'error'),
    warn: customLogger(path, 'warn'),
    info: customLogger(path, 'info'),
    getLabel: (key: keyof Labels) => labels[key][locale],
  };
}
