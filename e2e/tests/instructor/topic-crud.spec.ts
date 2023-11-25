import { expect, test } from '@playwright/test';
import { instructorJWT } from '../helpers';

test.describe.configure({
  mode: 'serial',
});

test.beforeEach(async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'jwt',
      value: instructorJWT,
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: true,
    },
  ]);

  await page.goto('/app/instructor/own-topics');
});

test('initially empty', async ({ page }) => {
  await expect(page.getByText('No records found')).toBeVisible();
});

test('check for validation messages', async ({ page }) => {
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByPlaceholder('Enter topic title').click();
  await page.getByLabel('Capacity').fill('-1');
  await page.getByPlaceholder('Enter topic description').click();
  await page.getByRole('banner').click();

  await expect(page.getByText('Title is required')).toBeVisible();
  await expect(
    page.getByText('Capacity can not be lower than 0'),
  ).toBeVisible();
  await expect(page.getByText('Description is required')).toBeVisible();
});

test('create topic', async ({ page }) => {
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByPlaceholder('Enter topic title').fill('test');
  await page
    .getByPlaceholder('Enter topic description')
    .fill('test description');

  const response = page.waitForResponse((resp) =>
    resp.url().includes('/api/topic'),
  );
  await page
    .getByRole('contentinfo')
    .getByRole('button', { name: 'Create' })
    .click();
  await response;

  await expect(
    page.getByRole('cell', { name: 'test', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'test description' }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Normal' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '0 / 1' })).toBeVisible();
  await expect(
    page.locator('button').filter({ hasText: 'Students' }),
  ).toBeVisible();
  await expect(
    page.locator('button').filter({ hasText: 'Weights' }),
  ).toBeVisible();
});

test('no assigned students', async ({ page }) => {
  await page.locator('button').filter({ hasText: 'Students' }).click();
  await expect(page.getByText('No assigned students')).toBeVisible();
});

test('adjust weights', async ({ page }) => {
  await page.locator('button').filter({ hasText: 'Weights' }).click();
  await expect(
    page.getByRole('row', { name: 'Select...' }).getByRole('button').nth(1),
  ).toBeDisabled();

  await page.getByRole('button', { name: 'Select...' }).click();
  await page.getByRole('button', { name: 'Test Course 0' }).click();
  await page.getByRole('textbox').fill('2');
  await page
    .getByRole('row', { name: 'Test Course 0 5' })
    .getByRole('button')
    .nth(1)
    .click();

  await expect(
    page.getByRole('row', { name: 'Test Course 0' }).locator('td').nth(1),
  ).toHaveText('5');
  await expect(
    page.getByRole('row', { name: 'Test Course 0' }).locator('td').nth(2),
  ).toHaveText('2');

  const request = page.waitForRequest((req) =>
    req.url().includes('/api/course/topic-preference'),
  );
  await page
    .getByRole('row', { name: 'Test Course 0 5 2' })
    .getByRole('button')
    .click();
  await request;

  await expect(
    page.getByRole('row', { name: 'Test Course 0 5 2' }),
  ).toHaveCount(0);
});

test('edit topic', async ({ page }) => {
  await page
    .getByRole('cell', { name: 'edit delete' })
    .getByTitle('edit')
    .click();
  await page.getByPlaceholder('Enter topic title').fill('test edited');
  await page.getByLabel('Type').click();
  await page.getByRole('button', { name: 'Research' }).click();
  await page.getByLabel('Capacity').fill('2');
  await page
    .getByPlaceholder('Enter topic description')
    .fill('test description edited');

  const request = page.waitForRequest((req) =>
    req.url().includes('/api/topic'),
  );
  await page.getByRole('button', { name: 'Update' }).click();
  await request;

  await expect(
    page.getByRole('cell', { name: 'test edited', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'test description edited' }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'research' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '0 / 2' })).toBeVisible();
  await expect(
    page.locator('button').filter({ hasText: 'Students' }),
  ).toBeVisible();
  await expect(
    page.locator('button').filter({ hasText: 'Weights' }),
  ).toBeVisible();
});

test('delete topic', async ({ page }) => {
  await page.getByRole('button', { name: 'delete' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect(page.getByText('No records found')).toBeVisible();
});

test('create multiple topics', async ({ page }) => {
  await page.getByRole('button', { name: 'Create' }).first().click();
  await page.getByPlaceholder('Enter topic title').fill('Topic 1');
  await page
    .getByPlaceholder('Enter topic description')
    .fill('topic 1 description');

  const response = page.waitForResponse((resp) =>
    resp.url().includes('/api/topic'),
  );
  await page
    .getByRole('contentinfo')
    .getByRole('button', { name: 'Create' })
    .click();
  await response;

  await page.getByRole('button', { name: 'Create' }).first().click();
  await page.getByPlaceholder('Enter topic title').fill('Topic 2');
  await page.getByLabel('Type').click();
  await page.getByRole('button', { name: 'Research' }).click();
  await page.getByLabel('Capacity').fill('5');
  await page.getByLabel('Description').fill('topic 2 description');

  const response2 = page.waitForResponse((resp) =>
    resp.url().includes('/api/topic'),
  );
  await page
    .getByRole('contentinfo')
    .getByRole('button', { name: 'Create' })
    .click();
  await response2;

  await expect(
    page.getByRole('cell', { name: 'Topic 1', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'topic 1 description' }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Normal' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '0 / 1' })).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Topic 2', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'topic 2 description' }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'research' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '0 / 5' })).toBeVisible();
});

test('delete multiple topics', async ({ page }) => {
  await page
    .getByRole('row', {
      name: 'Topic 1 topic 1 description Normal 0 / 1 edit edit edit delete',
    })
    .getByTitle('delete')
    .click();

  const response = page.waitForResponse((resp) =>
    resp.url().includes('/api/topic'),
  );
  await page.getByRole('button', { name: 'Confirm' }).click();
  await response;

  await page
    .getByRole('row', {
      name: 'Topic 2 topic 2 description research 0 / 5 edit edit edit delete',
    })
    .getByTitle('delete')
    .click();

  const response2 = page.waitForResponse((resp) =>
    resp.url().includes('/api/topic'),
  );
  await page.getByRole('button', { name: 'Confirm' }).click();
  await response2;

  await expect(page.getByText('No records found')).toBeVisible();
});
