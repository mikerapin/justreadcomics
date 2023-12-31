import { initScraperPage } from './util';
import { IMassImageImport } from '../types/scraper';
import { logError } from '../util/logger';
import { isProduction } from '../util/process';

/**
 * This only gets series description and a (bad) creator list
 * @param seriesUrl
 * @param headless
 */
export const scrapeImageSeries = async (seriesUrl: string, runHeadless?: boolean) => {
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  await page.goto(seriesUrl, { waitUntil: 'domcontentloaded' });

  const imageUrl = '';

  const descriptionSelector = '#main .grid-container .cell.small-12.medium-9';

  // get the description from the page?
  const description = await page.evaluate((selector) => {
    const mainContentText = document.querySelector(selector);
    if (mainContentText) {
      const paragraphs = mainContentText.querySelectorAll('p');
      let desc = '';
      paragraphs.forEach((p) => {
        if (!p.querySelector('h1') && !p.innerText.match('Read the ')) {
          desc = p.innerText.trim();
        }
      });
      return desc;
    }
  }, descriptionSelector);

  const seriesPageCreatorsSelector = '.sidebar aside';
  const bookDetailCreatorsSelector = '.credits aside';

  const firstBookSelector = '#main .cover-image';

  let creators = await page.evaluate((selector) => {
    const creatorsDom = document.querySelectorAll(selector);
    const creatorList: string[] = [];
    creatorsDom.forEach((creator) => {
      creatorList.push(creator.textContent?.trim() || '');
    });
    return creatorList;
  }, seriesPageCreatorsSelector);

  // click the first book link on the page
  const firstBookLink = await page.waitForSelector(firstBookSelector);
  if (firstBookLink) {
    await firstBookLink.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    creators = await page.evaluate((selector) => {
      const creatorsDom = document.querySelectorAll(selector);
      const creatorList: string[] = [];
      creatorsDom.forEach((creator) => {
        const c = creator.textContent?.trim() || '';
        if (!creatorList.includes(c)) {
          creatorList.push(c);
        }
      });
      return creatorList;
    }, bookDetailCreatorsSelector);
  }

  await browser.close();
  return {
    date: new Date().toJSON(),
    description,
    creators
  };
};

export const massImageImport = async (runHeadless: boolean) => {
  //
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

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
    logError(e);
    return {
      series: [],
      error: e
    };
  }
};
