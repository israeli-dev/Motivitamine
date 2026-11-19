import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('generates and regenerates a card privately, then saves, restores, exports and removes it', async ({ page }) => {
  await page.goto('/');
  const preview = page.locator('#card-preview');
  await expect(preview.getByText('Sample card')).toBeVisible();
  await page.getByLabel('Your name').fill('Amara');
  await page.getByLabel('Job or career').fill('Architect');
  await page.getByLabel('Hobby or hobbies').fill('weaving');
  const poetic = page.getByRole('radio', { name: 'Poetic' });
  await poetic.press('Space');
  await expect(poetic).toBeChecked();
  const submitted = page.waitForRequest('**/api/generate-quote');
  await page.getByRole('button', { name: 'Generate My Quote' }).click();
  expect((await submitted).postDataJSON()).toEqual({ occupation: 'Architect', hobbies: 'weaving', tone: 'poetic' });
  await expect(preview.getByText('Written by Gemini')).toBeVisible();
  await expect(preview.getByText('For Amara · Architect')).toBeVisible();
  await expect(preview.locator('blockquote')).toContainText('kinder light');

  await page.getByRole('button', { name: 'Generate My Quote' }).click();
  await expect(preview.locator('blockquote')).toContainText('quiet strength');
  await page.getByRole('button', { name: /16:9/ }).click();
  await page.getByRole('button', { name: 'Save to Library' }).click();
  await page.reload();
  const opener = page.getByRole('button', { name: /Saved Library/ });
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Close library' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole('button', { name: /quiet strength/ }).click();
  await expect(preview.locator('blockquote')).toContainText('quiet strength');
  await expect(page.getByRole('button', { name: /16:9/ })).toHaveAttribute('aria-pressed', 'true');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^AuraQuote-shared-patience-\d+\.png$/);
  const png = await readFile(await download.path());
  expect(png.toString('ascii', 1, 4)).toBe('PNG');
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1600, 900]);

  await opener.click();
  await dialog.getByRole('button', { name: 'Remove Shared Patience from library' }).click();
  await expect(dialog.getByText('No saved quotes yet.')).toBeVisible();
});

test('surfaces provider failures and recovers from invalid browser storage', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aura_quotes_library', '{"old":"invalid"}'));
  await page.goto('/');
  await page.getByLabel('Job or career').fill('Unavailable example');
  await page.getByLabel('Hobby or hobbies').fill('piano');
  await page.getByRole('button', { name: 'Generate My Quote' }).click();
  await expect(page.getByRole('alert')).toContainText('Gemini couldn’t generate a quote');
  await expect(page.locator('#card-preview').getByText('Sample card')).toBeVisible();
  await page.getByRole('button', { name: /Saved Library/ }).click();
  await expect(page.getByRole('dialog').getByText('No saved quotes yet.')).toBeVisible();
});

test('fits long banner text on mobile and shows only the card in print', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/api/generate-quote', (route) => route.fulfill({ json: {
    source: 'gemini', recommendedMood: 'summit', themeTag: 'Practice and Purpose', reflection: 'Small details matter.',
    quote: 'Every tiny decision you make is a chance to carry the patient curiosity of a gardener into your work: give what matters enough time to grow, and trust that careful hands can build something beautiful.',
  } }));
  await page.goto('/');
  await page.getByLabel('Your name').fill('A'.repeat(40));
  await page.getByLabel('Job or career').fill('B'.repeat(80));
  await page.getByLabel('Hobby or hobbies').fill('C'.repeat(120));
  await page.getByRole('button', { name: 'Generate My Quote' }).click();
  await expect(page.locator('#card-preview').getByText('Written by Gemini')).toBeVisible();
  await page.getByRole('button', { name: /16:9/ }).click();
  await page.getByRole('button', { name: 'Heroic' }).click();
  await page.evaluate(() => document.fonts.ready);
  const visible = page.locator('#card-preview .card-content');
  await expect.poll(() => visible.evaluate((element) => element.firstElementChild!.getBoundingClientRect().height <= element.clientHeight + 1)).toBe(true);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.studio-ui')).toBeHidden();
  await expect(page.locator('.export-surface .quote-card')).toBeVisible();
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  expect(pdf.toString('ascii', 0, 4)).toBe('%PDF');
  expect(pdf.toString('latin1').match(/\/Type \/Page\b/g)).toHaveLength(1);
});
