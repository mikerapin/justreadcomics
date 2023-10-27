import { initScraperPage } from './util';
import { IMassImageImport } from '../types/scraper';

export const massImageImport = async (headless: boolean) => {
  //
  const { page, browser } = await initScraperPage(headless);

  // this is the DC series list page, but it's a search page?
  // either way, it's loading 100 pages of all comic series sorted by title
  await page.goto('https://imagecomics.com/comics/series', { waitUntil: 'domcontentloaded' });

  try {
    await page.waitForSelector('.all-series');

    // get series blocks selector
    const titlesLocator = '.all-series li a';

    const snaggedTitles = await page.evaluate((selector) => {
      const seriesData: IMassImageImport[] = [];

      const seriesLinks = document.querySelectorAll(selector);

      seriesLinks.forEach((link) => {
        const seriesLinkElement = link as HTMLAnchorElement;

        const seriesLink = seriesLinkElement.getAttribute('href');
        const seriesName = seriesLinkElement.innerText;

        if (seriesLink && seriesName) {
          seriesData.push({
            seriesLink,
            seriesName
          });
        }
      });

      return seriesData;
    }, titlesLocator);

    await browser.close();

    return {
      series: snaggedTitles
    };
  } catch (e: any) {
    console.log(e);
    return {
      series: [],
      error: e
    };
  }
};
