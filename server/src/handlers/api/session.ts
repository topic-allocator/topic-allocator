import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Session } from '../../lib';

export async function retrieveSession(
  _: HttpRequest,
  __: InvocationContext,
  session: Session,
): Promise<HttpResponseInit> {
  return {
    jsonBody: {
      ...session,
    },
  };
}
