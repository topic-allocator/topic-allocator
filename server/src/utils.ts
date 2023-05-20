import { createHmac } from 'node:crypto';

export function checkForLtiFields(params: FormData) {
  let hasNeccessaryFields = true;

  const requiredFields = [
    'lti_message_type',
    'lti_version',
    'resource_link_id',
    'roles',
    'lis_person_contact_email_primary',
    'lis_person_name_full',

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
