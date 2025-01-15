const {
  'liveServer.settings.port': liveServerPort,
} = require('../.vscode/settings.json');

// @ts-check
import { test, expect } from '@playwright/test';
const mainPageUrl = `http://localhost:${liveServerPort}/`;
const plantsPageUrl = `${mainPageUrl}pages/plants.html`;
const modernDesignPageUrl = `${mainPageUrl}pages/modern-design.html`;
const spacePageUrl = `${mainPageUrl}pages/space.html`;
const naturePageUrl = `${mainPageUrl}pages/nature.html`;

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

test.beforeEach('Run the Main Page', async ({ page }) => {
  await page.goto(mainPageUrl);
});

test('The project development server is running', async ({ page }) => {
  expect(page.url()).toBe(mainPageUrl);
});

test('Main Page: Page Heading exists', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Digital Art Gallery' })
  ).toBeAttached();
});

// CSS connection tests

test('Main Page: layout.css should be connected', async ({ page }) => {
  const cssLocator = page.locator('[rel="stylesheet"]');
  const firstCSSLocator = await cssLocator.nth(0);
  const cssPath = (await firstCSSLocator.getAttribute('href')) || '';
  const url = `${mainPageUrl}${preparePath(cssPath)}`;
  const res = await page.request.get(url);
  expect(cssPath.length).toBeGreaterThan(0);
  expect(cssPath.includes('layout.css')).toBe(true);
  expect(res.status()).toBe(200);
});

test('Main Page: image-list.css should be connected', async ({ page }) => {
  const cssLocator = page.locator('[rel="stylesheet"]');
  const firstCSSLocator = await cssLocator.nth(1);
  const cssPath = (await firstCSSLocator.getAttribute('href')) || '';
  const url = `${mainPageUrl}${preparePath(cssPath)}`;
  const res = await page.request.get(url);
  expect(cssPath.length).toBeGreaterThan(0);
  expect(cssPath.includes('images-list.css')).toBe(true);
  expect(res.status()).toBe(200);
});

test('Main Page: The header container is a flex container, which comes from layout.css', async ({
  page,
}) => {
  const headerLocator = page.locator('header');
  await expect(headerLocator).toHaveCSS('display', 'flex');
});

test("Main Page: The 'gallery-items' container is a flex container, which comes from image-list.css", async ({
  page,
}) => {
  const galleryContainerLocator = page.locator('.gallery-items');
  await expect(galleryContainerLocator).toHaveCSS('display', 'flex');
});

// JavaScript connection tests

test('Main Page: JavaScript file relative path points to an existing JS files', async ({
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

test('Main Page: there should be a single logged message in the console', async ({
  page,
}) => {
  const logs = [];
  page.on('console', (message) => {
    logs.push(message.text());
  });
  await page.goto(mainPageUrl);
  expect(logs.includes('The scripts file is connected!')).toBeTruthy();
});

test('Main Page: there should be no error messages in the console', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (exception) => {
    errors.push(exception);
  });
  await page.goto(mainPageUrl);
  expect(errors.length).toBe(0);
});

// Images loading tests

test('Main Page: The design-image.jpg image file path is used for the Modern Design card', async ({
  page,
}) => {
  await page.waitForLoadState('domcontentloaded');
  const images = page.locator('img');
  const imageSrc = (await images.nth(0).getAttribute('src')) || '';
  const url = `${mainPageUrl}${preparePath(imageSrc)}`;
  console.log(url);
  const res = await page.request.get(url);
  expect(imageSrc.length).toBeGreaterThan(0);
  expect(imageSrc.includes('design-image.jpg')).toBe(true);
  expect(res.status()).toBe(200);
});

test('Main Page: The plant-image.jpg image file path is used for the Plants card', async ({
  page,
}) => {
  await page.waitForLoadState('domcontentloaded');
  const images = page.locator('img');
  const imageSrc = (await images.nth(1).getAttribute('src')) || '';
  const url = `${mainPageUrl}${preparePath(imageSrc)}`;
  console.log(url);
  const res = await page.request.get(url);
  expect(imageSrc.length).toBeGreaterThan(0);
  expect(imageSrc.includes('plant-image.jpg')).toBe(true);
  expect(res.status()).toBe(200);
});

test('Main Page: The space-image.jpg image file path is used for the Space card', async ({
  page,
}) => {
  await page.waitForLoadState('domcontentloaded');
  const images = page.locator('img');
  const imageSrc = (await images.nth(2).getAttribute('src')) || '';
  const url = `${mainPageUrl}${preparePath(imageSrc)}`;
  console.log(url);
  const res = await page.request.get(url);
  expect(res.status()).toBe(200);
  expect(imageSrc.includes('space-image.jpg')).toBe(true);
  expect(imageSrc.length).toBeGreaterThan(0);
});

test('Main Page: The nature-image.jpg image file path is used for the Nature card', async ({
  page,
}) => {
  await page.waitForLoadState('domcontentloaded');
  const images = page.locator('img');
  const imageSrc = (await images.nth(3).getAttribute('src')) || '';
  const url = `${mainPageUrl}${preparePath(imageSrc)}`;
  console.log(url);
  const res = await page.request.get(url);
  expect(imageSrc.length).toBeGreaterThan(0);
  expect(imageSrc.includes('nature-image.jpg')).toBe(true);
  expect(res.status()).toBe(200);
});

// Top Navigation tests

test('Main Page: Should open the nature page when clicked in the top navigation', async ({
  page,
}) => {
  const natureLink = await page
    .locator('nav')
    .getByRole('link', { name: 'Nature' })
    .click();
  expect(page.url()).toBe(naturePageUrl);
});

test('Main Page: Should open the space page when clicked in the top navigation', async ({
  page,
}) => {
  const spaceLink = await page
    .locator('nav')
    .getByRole('link', { name: 'Space' })
    .click();
  expect(page.url()).toBe(spacePageUrl);
});

test('Main Page: Should open the plants page when clicked in the top navigation', async ({
  page,
}) => {
  const plantsLink = await page
    .locator('nav')
    .getByRole('link', { name: 'Plants' })
    .click();
  expect(page.url()).toBe(plantsPageUrl);
});

test('Main Page: Plant details Should open the Modern Design page when clicked in the item card', async ({
  page,
}) => {
  const plantsLink = await page
    .getByRole('link', { name: 'Plants Details' })
    .click();
  expect(page.url()).toBe(plantsPageUrl);
});

test('Main Page: Modern Design details link should open Modern Design page when clicked in the item card', async ({
  page,
}) => {
  const modernDEsignLink = await page
    .getByRole('link', { name: 'Modern Design Details' })
    .click();
  expect(page.url()).toBe(modernDesignPageUrl);
});

test('Main Page: Space details link should open Space page when clicked in the item card', async ({
  page,
}) => {
  const spaceLink = await page
    .getByRole('link', { name: 'Space Details' })
    .click();
  expect(page.url()).toBe(spacePageUrl);
});

test('Main Page: Nature details link should open Nature page when clicked in the item card', async ({
  page,
}) => {
  const natureLink = await page
    .getByRole('link', { name: 'Nature Details' })
    .click();
  expect(page.url()).toBe(naturePageUrl);
});
