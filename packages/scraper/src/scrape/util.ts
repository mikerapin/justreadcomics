import puppeteer from 'puppeteer';

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e: unknown) {
      lastErr = e;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastErr;
}

export const initScraperPage = async (runHeadless = true) => {
  // Launch the browser
  const browser = await puppeteer.launch({ headless: runHeadless });

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

/**
 * Strips parenthesis from a search value
 * @param search
 */
export const cleanSearch = (search: string) => {
  let result = search;
  let prevResult;

  // Keep removing parentheses until no more changes
  do {
    prevResult = result;
    result = result.replace(/ *\([^()]*\) */g, ' ');
  } while (result !== prevResult);

  // Clean up any double spaces
  return result.replace(/\s+/g, ' ').trim();
};
