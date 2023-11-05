import puppeteer from 'puppeteer';

export const initScraperPage = async (headless = true) => {
  // Launch the browser
  const browser = await puppeteer.launch({ headless });

  // Create a page
  const page = await browser.newPage();
  page.on('error', (err) => {
    console.log('Puppeteer error.', err);
  });

  await page.setViewport({
    width: 1280,
    height: 720
  });
  return { page, browser };
};

export const cleanSearch = (search: string) => {
  return search.replace(/ *\([^)]*\) */g, '');
};
