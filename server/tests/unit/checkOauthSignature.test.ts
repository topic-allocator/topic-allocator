import { checkOauthSignature } from '../../src/lib/utils';
import { buildValidLtiRequestForm } from './helpers';
import { describe, test, expect } from 'vitest';

describe('testing checkOauthSignature', () => {
  test('success on valid LTI request', () => {
    process.env.LTI_SECRET = 'secret';
    const validForm = buildValidLtiRequestForm();
    expect(
      checkOauthSignature('POST', 'http://127.0.0.1:7071/lti', validForm),
    ).toBe(true);
  });

  test('fail on invalid secret', () => {
    process.env.LTI_SECRET = 'invalid';
    const validForm = buildValidLtiRequestForm();
    expect(
      checkOauthSignature('POST', 'http://127.0.0.1:7071/lti', validForm),
    ).toBe(false);
  });

  test('fail on missing field', () => {
    process.env.LTI_SECRET = 'secret';
    const form = buildValidLtiRequestForm();
    form.delete('oauth_version');

    expect(checkOauthSignature('POST', 'http://127.0.0.1:7071/lti', form)).toBe(
      false,
    );
  });

  test('fail on wrong signature', () => {
    process.env.LTI_SECRET = 'secret';
    const form = buildValidLtiRequestForm();
    form.set('oauth_signature', 'wrong');

    expect(checkOauthSignature('POST', 'http://127.0.0.1:7071/lti', form)).toBe(
      false,
    );
  });
});
