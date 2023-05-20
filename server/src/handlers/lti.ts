import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { readFile } from 'fs/promises';
import { checkForLtiFields, checkOauthSignature } from '../utils';
import { sign } from 'jsonwebtoken';

export async function lti(
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
  const email = formData.get('lis_person_contact_email_primary')!.toString();
  const roles = formData.get('roles')!.toString().split(',');

  const jwt = sign({ name, email, roles }, process.env.JWT_SECRET!);

  if (process.env.DEV) {
    return {
      status: 301,
      headers: {
        location: 'http://localhost:5173/lti',
        // 'jwt' cookie must be set manually
      },
      body: null,
    };
  }

  try {
    const fileToServe = await readFile('static/index.html', 'utf8');
    return {
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': `jwt=${jwt}; Path=/; HttpOnly; Secure; SameSite=None;`,
      },
      body: fileToServe,
    };
  } catch (error) {
    context.error(error);
    return {
      status: 500,
      body: 'Error reading file',
    };
  }
}
