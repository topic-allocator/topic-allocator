import { HttpRequest } from '@azure/functions';
import { createHmac } from 'node:crypto';
import { verify } from 'jsonwebtoken';

// TODO: maybe use Zodd for this
export function checkForLtiFields(params: FormData): boolean {
  let hasNeccessaryFields = true;

  const requiredFields = [
    'lti_message_type',
    'lti_version',
    'resource_link_id',
    'roles',
    'lis_person_contact_email_primary',
    'lis_person_name_full',
    'ext_user_username',
    'launch_presentation_locale',

    'oauth_consumer_key',
    'oauth_signature_method',
    'oauth_timestamp',
    'oauth_nonce',
    'oauth_version',
    'oauth_signature',
    'oauth_callback',
  ];

  requiredFields.forEach((field) => {
    if (!params.has(field)) {
      hasNeccessaryFields = false;
    }
  });

  return hasNeccessaryFields;
}

export function checkOauthSignature(method: string, url: string, params: FormData): boolean {
  const oauthSignature = params.get('oauth_signature');
  params.delete('oauth_signature');

  const launchParams = Array.from(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
    .join('&');

  const stringToSign = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(launchParams)
    // parentheses must be manually double encoded
    .replace(/\(/g, '%2528')
    .replace(/\)/g, '%2529')}`;

  const hmac = createHmac('sha1', `${process.env.LTI_SECRET}&`);
  const signarure = hmac.update(stringToSign, 'utf8').digest('base64');

  return signarure === oauthSignature;
}

export type SessionInput = {
  name: string;
  neptun: string;
  locale: 'hu' | 'en';
  roles: string[];
};

export interface Session extends SessionInput {
  iat: number;
}

export function getSession(request: HttpRequest): Session | undefined {
  const cookieString = request.headers.get('Cookie');
  if (!cookieString) {
    return;
  }

  const { jwt } = parseCookie(cookieString);

  try {
    return verify(jwt, process.env.JWT_SECRET!) as Session;
  } catch (error) {
    console.error(error);
    return;
  }
}

function parseCookie(cookieString: string): Record<string, string> {
  const keyValuePairs = cookieString.split(';').map((cookie) => cookie.split('='));

  const parsedCookie = keyValuePairs.reduce<Record<string, string>>(function (obj, cookie) {
    obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(cookie[1].trim());

    return obj;
  }, {});

  return parsedCookie;
}
