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
const morePlantsLink = 'https://unsplash.com/s/photos/plants';

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

test.beforeEach('Run the Plants Page', async ({ page }) => {
  await page.goto(plantsPageUrl);
});

test('The Plants page is running', async ({ page }) => {
  expect(page.url()).toBe(plantsPageUrl);
});

test('Plants Page: Page Heading exists', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Plants' })).toBeAttached();
});

// CSS connection tests

test('Plants Page: layout.css should be connected', async ({ page }) => {
  const cssLocator = page.locator('[rel="stylesheet"]');
  const firstCSSLocator = await cssLocator.nth(0);
  const cssPath = (await firstCSSLocator.getAttribute('href')) || '';
  const url = `${mainPageUrl}${preparePath(cssPath)}`;
  const res = await page.request.get(url);
  expect(cssPath.length).toBeGreaterThan(0);
  expect(cssPath.includes('layout.css')).toBe(true);
  expect(res.status()).toBe(200);
});

test('Plants Page: image-detail.css should be connected', async ({ page }) => {
  const cssLocator = page.locator('[rel="stylesheet"]');
  const secondCSSLocator = await cssLocator.nth(1);
  const cssPath = (await secondCSSLocator.getAttribute('href')) || '';
  const url = `${mainPageUrl}${preparePath(cssPath)}`;
  const res = await page.request.get(url);
  expect(cssPath.length).toBeGreaterThan(0);
  expect(cssPath.includes('image-detail.css')).toBe(true);
  expect(res.status()).toBe(200);
});

test('Plants Page: The header container should be a flex container, if layout.css is connected', async ({
  page,
}) => {
  const headerLocator = page.locator('header');
  await expect(headerLocator).toHaveCSS('display', 'flex');
});

test("Plants Page: The 'image-details' should a flex container, if the image-list.css is connected", async ({
  page,
}) => {
  const imageDetailsContainerLocator = page.locator('.image-details');
  await expect(imageDetailsContainerLocator).toHaveCSS('display', 'flex');
});

// JavaScript connection tests

test('Plants Page: JavaScript file relative path points to an existing JS files', async ({
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

test('Plants Page: the scripts.js file should be connected', async ({
  page,
}) => {
  const logs = [];
  page.on('console', (message) => {
    logs.push(message.text());
  });
  await page.goto(plantsPageUrl);
  expect(logs.includes('The scripts file is connected!')).toBeTruthy();
});

test('Plants Page: there should be no error messages in the console', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (exception) => {
    errors.push(exception);
  });
  await page.goto(plantsPageUrl);
  expect(errors.length).toBe(0);
});

// Images connection tests

test('Plants Page: The plant-image.jpg image file path is used for the main image', async ({
  page,
}) => {
  await page.waitForLoadState('domcontentloaded');
  const image = page.locator('img');
  const imageSrc = (await image.getAttribute('src')) || '';
  const url = `${mainPageUrl}${preparePath(imageSrc)}`;
  const res = await page.request.get(url);
  expect(imageSrc.length).toBeGreaterThan(0);
  expect(imageSrc.includes('plant-image.jpg')).toBe(true);
  expect(res.status()).toBe(200);
});

// Top Navigation connection tests

test('Plants Page: Should open the nature page when clicked in the top navigation', async ({
  page,
}) => {
  const natureLink = await page
    .locator('nav')
    .getByRole('link', { name: 'Nature' })
    .click();
  expect(page.url()).toBe(naturePageUrl);
});

test('Plants Page: Should open the space page when clicked in the top navigation', async ({
  page,
}) => {
  const spaceLink = await page
    .locator('nav')
    .getByRole('link', { name: 'Space' })
    .click();
  expect(page.url()).toBe(spacePageUrl);
});

test('Plants Page: Should open the plants page when clicked in the top navigation', async ({
  page,
}) => {
  const plantsLink = await page
    .locator('nav')
    .getByRole('link', { name: 'Plants' })
    .click();
  expect(page.url()).toBe(plantsPageUrl);
});

test('Plants Page: Should open the modern design page when clicked in the top navigation', async ({
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

test('"Prev: Modern Design" link should redirect to the Modern Design page', async ({
  page,
}) => {
  const prevModernDesignLink = await page
    .getByRole('link', { name: 'Prev: Modern Design' })
    .click();
  expect(page.url()).toBe(modernDesignPageUrl);
});

test('"Next: Nature" link should redirect to the Nature page', async ({
  page,
}) => {
  const nexNatureLink = await page
    .getByRole('link', { name: 'Next: Nature' })
    .click();
  expect(page.url()).toBe(naturePageUrl);
});

test('"More Modern Design Images" link should use an absolute path to unsplash.com "modern design" collection page', async ({
  page,
}) => {
  const nexModernDesignLink = await page
    .getByRole('link', { name: 'More Plants Images' })
    .click();
  expect(page.url() === morePlantsLink).toBeTruthy();
});
