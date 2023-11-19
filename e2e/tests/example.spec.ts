import { test, expect } from '@playwright/test';
import { studentJWT } from './helpers';

test.beforeEach(async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'jwt',
      value: studentJWT,
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: true,
    },
  ]);

  await page.goto('http://localhost:7071/app');
});

test('has title', async ({ page }) => {
  await expect(page).toHaveTitle(/Epikus lti alkalmazás/);
});
