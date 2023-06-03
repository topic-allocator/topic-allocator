import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { checkForLtiFields, checkOauthSignature, Session, SessionInput } from '../utils';
import { sign } from 'jsonwebtoken';

export async function launchLTI(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const { method, url } = request;
  const formData = await request.formData();

  const isValid =
    //@ts-ignore (FormData type is acting funny)
    checkForLtiFields(formData) && checkOauthSignature(method, url, formData);

  if (!isValid) {
    context.warn('Invalid LTI request');

    return {
      status: 401,
      body: 'Invalid LTI request',
    };
  }

  const name = formData.get('lis_person_name_full')!.toString();
  const neptun = formData.get('ext_user_username')!.toString();
  const locale = formData.get('launch_presentation_locale')!.toString() as 'hu' | 'en';
  const roles = formData.get('roles')!.toString().split(',');
  const jwt = sign({ name, neptun, locale, roles } satisfies SessionInput, process.env.JWT_SECRET!);

  if (process.env.DEV) {
    console.log({ jwt });
    return {
      status: 301,
      headers: {
        location: 'http://localhost:5173/app',
        // 'jwt' cookie must be set manually
      },
    };
  }

  return {
    status: 301,
    headers: {
      location: '/app',
      'Set-Cookie': `jwt=${jwt}; Path=/; HttpOnly; Secure; SameSite=None;`,
    },
  };
}
