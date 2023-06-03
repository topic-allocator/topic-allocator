import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getSession } from '../../utils';

export async function retrieveSession(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const session = getSession(request);
  if (!session) {
    context.warn('Invalid session');
    return {
      status: 401,
      body: 'Unathorized',
    };
  }

  return {
    jsonBody: {
      ...session,
    },
  };
}
