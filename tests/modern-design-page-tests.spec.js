const {
  'liveServer.settings.port': liveServerPort,
} = require('../.vscode/settings.json');

// @ts-check
import { test, expect } from '@playwright/test';

// Functions and constants

const mainPageUrl = `http://localhost:${liveServerPort}/`;
const mainPageUrlLong = `${mainPageUrl}index.html`;
const plantsPageUrl = `${mainPageUrl}pages/plants.html`;
const modernDesignPageUrl = `${mainPageUrl}pages/modern-design.html`;
const spacePageUrl = `${mainPageUrl}pages/space.html`;
const naturePageUrl = `${mainPageUrl}pages/nature.html`;
const moreModernDesignLink = 'https://unsplash.com/s/photos/modern-design';

const preparePath = (path) => {
  if (path.startsWith('../')) {
    return preparePath(path.substring(3));
  } else if (path.startsWith('./')) {
    return preparePath(path.substring(2));
  } else if (path.startsWith('.') || path.startsWith('/')) {
    return preparePath(path.substring(1));
  } else {
    return path;
  }
};

// Open Main Page before each test and test the page to run

test.beforeEach('Run the Modern Design Page', async ({ page }) => {
  await page.goto(modernDesignPageUrl);
});

test('The Modern Design page is running', async ({ page }) => {
  expect(page.url()).toBe(modernDesignPageUrl);
});

test('Modern Design Page: Page Heading exists', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Modern Design' })
  ).toBeAttached();
});

// CSS connection tests

test('Modern Design Page: layout.css should be connected', async ({ page }) => {
  const cssLocator = page.locator('[rel="stylesheet"]');
  const firstCSSLocator = await cssLocator.nth(0);
  const cssPath = (await firstCSSLocator.getAttribute('href')) || '';
  const url = `${mainPageUrl}${preparePath(cssPath)}`;
  const res = await page.request.get(url);
  expect(cssPath.length).toBeGreaterThan(0);
  expect(cssPath.includes('layout.css')).toBe(true);
  expect(res.status()).toBe(200);
});

test('Modern Design Page: image-detail.css should be connected', async ({
  page,
}) => {
  const cssLocator = page.locator('[rel="stylesheet"]');
  const secondCSSLocator = await cssLocator.nth(1);
  const cssPath = (await secondCSSLocator.getAttribute('href')) || '';
  const url = `${mainPageUrl}${preparePath(cssPath)}`;
  const res = await page.request.get(url);
  expect(cssPath.length).toBeGreaterThan(0);
  expect(cssPath.includes('image-detail.css')).toBe(true);
  expect(res.status()).toBe(200);
});

test('Modern Design Page: The header container should be a flex container, if layout.css is connected', async ({
  page,
}) => {
  const headerLocator = page.locator('header');
  await expect(headerLocator).toHaveCSS('display', 'flex');
});

test("Modern Design Page: The 'image-details' should a flex container, if the image-list.css is connected", async ({
  page,
}) => {
  const imageDetailsContainerLocator = page.locator('.image-details');
  await expect(imageDetailsContainerLocator).toHaveCSS('display', 'flex');
});

// JavaScript connection tests

test('Modern Design Page: JavaScript file relative path points to an existing JS files', async ({
  page,
}) => {
  const scriptLocator = page.locator('[defer]');
  const scriptPath = (await scriptLocator.getAttribute('src')) || '';
  const url = `${mainPageUrl}${preparePath(scriptPath)}`;
  const res = await page.request.get(url);
  expect(scriptPath.length).toBeGreaterThan(0);
  expect(scriptPath.includes('scripts.js')).toBe(true);
  expect.soft(res.status()).toBe(200);
});

test('Modern Design Page: the scripts.js file should be connected', async ({
  page,
}) => {
  const logs = [];
  page.on('console', (message) => {
    logs.push(message.text());
  });
  await page.goto(modernDesignPageUrl);
  expect(logs.includes('The scripts file is connected!')).toBeTruthy();
});

test('Modern Design Page: there should be no error messages in the console', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (exception) => {
    errors.push(exception);
  });
  await page.goto(modernDesignPageUrl);
  expect(errors.length).toBe(0);
});

// Images connection tests

test('Modern Design Page: The design-image.jpg image file path is used for the main image', async ({
  page,
}) => {
  await page.waitForLoadState('domcontentloaded');
  const image = page.locator('img');
  const imageSrc = (await image.getAttribute('src')) || '';
  const url = `${mainPageUrl}${preparePath(imageSrc)}`;
  const res = await page.request.get(url);
  expect(imageSrc.length).toBeGreaterThan(0);
  expect(imageSrc.includes('design-image.jpg')).toBe(true);
  expect(res.status()).toBe(200);
});

// Top Navigation connection tests

test('Modern Design Page: Should open the nature page when clicked in the top navigation', async ({
  page,
}) => {
  const natureLink = await page
    .locator('nav')
    .getByRole('link', { name: 'Nature' })
    .click();
  expect(page.url()).toBe(naturePageUrl);
});

test('Modern Design Page: Should open the space page when clicked in the top navigation', async ({
  page,
}) => {
  const spaceLink = await page
    .locator('nav')
    .getByRole('link', { name: 'Space' })
    .click();
  expect(page.url()).toBe(spacePageUrl);
});

test('Modern Design Page: Should open the plants page when clicked in the top navigation', async ({
  page,
}) => {
  const plantsLink = await page
    .locator('nav')
    .getByRole('link', { name: 'Plants' })
    .click();
  expect(page.url()).toBe(plantsPageUrl);
});

test('Modern Design: Should open the modern design page when clicked in the top navigation', async ({
  page,
}) => {
  const modernDesignLink = await page
    .locator('nav')
    .getByRole('link', { name: 'Modern Design' })
    .click();
  expect(page.url()).toBe(modernDesignPageUrl);
});

// Back to home page link tests

test('Back to home page link should redirect to the main page', async ({
  page,
}) => {
  const backHomeLinkLocator = await page
    .getByRole('link', { name: 'Back to Home Page' })
    .click();
  expect([mainPageUrl, mainPageUrlLong].includes(page.url())).toBeTruthy();
});

// Bottom Navigation Tests

test('"Prev: Space" link should redirect to the Space page', async ({
  page,
}) => {
  const prevNatureLink = await page
    .getByRole('link', { name: 'Prev: Space' })
    .click();
  expect(page.url()).toBe(spacePageUrl);
});

test('"Next: Plants" link should redirect to the Plants page', async ({
  page,
}) => {
  const nexModernDesignLink = await page
    .getByRole('link', { name: 'Next: Plants' })
    .click();
  expect(page.url()).toBe(plantsPageUrl);
});

test('"More Modern Design Images" link should use an absolute path to unsplash.com "modern design" collection page', async ({
  page,
}) => {
  const nexModernDesignLink = await page
    .getByRole('link', { name: 'More Modern Design Images' })
    .click();
  expect(page.url() === moreModernDesignLink).toBeTruthy();
});
