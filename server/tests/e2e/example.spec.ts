import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'jwt',
      value:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsIm5hbWUiOiJKw6Fub3MgS3Vsa2EiLCJsb2NhbGUiOiJlbiIsImlzQWRtaW4iOmZhbHNlLCJpc0luc3RydWN0b3IiOmZhbHNlLCJpc1N0dWRlbnQiOnRydWUsImlhdCI6MTY5NTEzNTk3NH0.92oZGpR4cmEgAiAkiIk7UZSN3-FUZPGsrFtbIO_tQB0',
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
