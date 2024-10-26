import { test, expect } from '@playwright/test';
import { studentJWT } from '../helpers';

test.describe.configure({
  mode: 'serial',
});

test.beforeEach(async ({ context }) => {
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
});

test('preference list initially empty', async ({ page }) => {
  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.goto('/app/preferences');
    await response;
  }
  await expect(page.getByText('No records found')).toBeVisible();
});

test('warning visible', async ({ page }) => {
  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.goto('/app/preferences');
    await response;
  }
  await expect(
    page.getByText('At least 10 preferences are required'),
  ).toBeVisible();
});

test('add preference', async ({ page }) => {
  {
    const response = page.waitForResponse(/topic.getMany/);
    await page.goto('/app/topic-list');
    await response;
  }

  await page.getByLabel('InstructorAll').click();
  await page
    .getByRole('button', { name: 'Test Instructor 2', exact: true })
    .click();

  const response = page.waitForResponse(/student.createTopicPreference/);
  await page
    .getByRole('row', { name: 'Test Topic 0 hu Test' })
    .getByRole('button')
    .first()
    .click();
  await response;

  await expect(
    page.getByRole('button', { name: 'Remove from preference list' }),
  ).toBeVisible();

  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.goto('/app/preferences');
    await response;
  }

  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByRole('cell', { name: '1' })).toBeVisible();
  await expect(page.locator('tbody tr').first()).toHaveText(
    'Test Topic 0Language: huRank: 1Description: Test Description 0Type: NormalInstructor: Test Instructor 2Move upMove down',
  );
});

test('remove preference', async ({ page }) => {
  {
    const response = page.waitForResponse(/topic.getMany/);
    await page.goto('/app/topic-list');
    await response;
  }

  await page.getByLabel('InstructorAll').click();
  await page
    .getByRole('button', { name: 'Test Instructor 2', exact: true })
    .click();

  const response = page.waitForResponse((resp) =>
    resp.url().includes('student.deleteTopicPreference'),
  );
  await page
    .getByRole('button', { name: 'Remove from preference list' })
    .click();
  await response;

  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.goto('/app/preferences');
    await response;
  }

  await expect(page.getByText('No records found')).toBeVisible();
  await expect(
    page.getByText('At least 10 preferences are required'),
  ).toBeVisible();
});

test('add 10 preferences', async ({ page }) => {
  {
    const response = page.waitForResponse(/topic.getMany/);
    await page.goto('/app/topic-list');
    await response;
  }

  await page.getByLabel('InstructorAll').click();
  await page
    .getByRole('button', { name: 'Test Instructor 2', exact: true })
    .click();

  for (let i = 0; i < 10; i++) {
    const response = page.waitForResponse(/student.createTopicPreference/);

    await page
      .locator('tbody tr')
      .nth(i)
      .getByTitle('Add to preference list')
      .click();

    await response;
  }

  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.goto('/app/preferences');
    await response;
  }

  await expect(page.locator('tbody tr')).toHaveCount(10);
  await expect(
    page.getByText('At least 10 preferences are required'),
  ).not.toBeVisible();

  for (let i = 0; i < 10; i++) {
    await expect(
      page.locator('tbody tr').nth(i).locator('td').nth(2),
    ).toContainText((i + 1).toString());
  }

  await expect(page.getByText('Saved')).toBeVisible();
});

test('move preferences up and down', async ({ page }) => {
  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.goto('/app/preferences');
    await response;
  }

  await page
    .getByRole('row', { name: 'Test Topic 0 hu 1 Test' })
    .getByRole('button')
    .click();

  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

  await expect(
    page.locator('tbody tr').first().locator('td').first(),
  ).toHaveText('Test Topic 1');
  await expect(
    page.locator('tbody tr').nth(1).locator('td').first(),
  ).toHaveText('Test Topic 0');

  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.getByRole('button', { name: 'Save' }).click();
    await response;
  }

  await expect(page.getByText('Saved')).toBeVisible();

  await expect(
    page.locator('tbody tr').first().locator('td').first(),
  ).toHaveText('Test Topic 1');
  await expect(
    page.locator('tbody tr').nth(1).locator('td').first(),
  ).toHaveText('Test Topic 0');

  await page
    .getByRole('row', { name: 'Test Topic 0 hu 2 Test' })
    .getByRole('button')
    .first()
    .click();

  await expect(
    page.locator('tbody tr').first().locator('td').first(),
  ).toHaveText('Test Topic 0');
  await expect(
    page.locator('tbody tr').nth(1).locator('td').first(),
  ).toHaveText('Test Topic 1');

  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.getByRole('button', { name: 'Save' }).click();
    await response;
  }

  await expect(page.getByText('Saved')).toBeVisible();

  await expect(
    page.locator('tbody tr').first().locator('td').first(),
  ).toHaveText('Test Topic 0');
  await expect(
    page.locator('tbody tr').nth(1).locator('td').first(),
  ).toHaveText('Test Topic 1');
});

test('clear preferences', async ({ page }) => {
  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.goto('/app/preferences');
    await response;
  }
  await expect(page.locator('tbody tr')).toHaveCount(10);

  {
    const response = page.waitForResponse(/topic.getMany/);
    await page.goto('/app/topic-list');
    await response;
  }

  {
    const response = page.waitForResponse(/topic.getMany/);
    await page
      .locator('tbody tr')
      .getByTitle('Remove from preference list')
      .first()
      .click();
    await response;
  }

  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.goto('/app/preferences');
    await response;
  }

  await expect(
    page.getByText('At least 10 preferences are required'),
  ).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(9);

  await page.goto('/app/topic-list');

  for (let i = 1; i < 10; i++) {
    const response = page.waitForResponse(/student.deleteTopicPreference/);
    await page
      .locator('tbody tr')
      .nth(i)
      .getByTitle('Remove from preference list')
      .click();
    await response;
  }

  {
    const response = page.waitForResponse(/student.getPreferences/);
    await page.goto('/app/preferences');
    await response;
  }

  await expect(
    page.getByText('At least 10 preferences are required'),
  ).toBeVisible();
  await expect(page.getByText('No records found')).toBeVisible();
});
