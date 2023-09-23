import { checkForLtiFields } from '../../src/lib';
import { buildValidLtiRequestForm } from './helpers';
import { describe, test, expect } from 'vitest';

describe('testing checkForLtiFields', () => {
  test('fail on empty form', () => {
    expect(checkForLtiFields(new FormData())).toBe(false);
  });

  test('pass on valid form', () => {
    const validForm = buildValidLtiRequestForm();
    expect(checkForLtiFields(validForm)).toBe(true);
  });

  test('fail on missing field', () => {
    const form = buildValidLtiRequestForm();
    form.delete('oauth_version');

    expect(checkForLtiFields(form)).toBe(false);
  });
});
