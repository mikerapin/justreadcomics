import { cleanSearch, initScraperPage } from './util';
import { Creator } from 'client/src/types/series';
import { isProduction } from '../util/process';

export const searchScrapeCorpo = async (search: string, runHeadless?: boolean) => {
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  const cleanedSearch = cleanSearch(search);

  const searchQuery = 'https://www.amazon.com/s?k=%s&i=comics-manga&rh=n%3A156104011%2Cp_n_feature_browse-bin%3A13684862011'.replace(
    '%s',
    encodeURIComponent(cleanedSearch)
  );

  await page.goto(searchQuery, { waitUntil: 'domcontentloaded' });

  // const firstSearchResultSelector = 'div.s-search-results ::-p-text(Kindle Edition)';

  let imageUrl;
  let seriesPageUrl;
  let seriesDescription;
  let seriesCreators;
  let withinCU;

  const partOfLinkSelector = '.s-search-results .s-widget-container ::-p-text(Part of)';

  const partOfLink = await page.waitForSelector(partOfLinkSelector);
  if (partOfLink) {
    await partOfLink.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const imageUrlSelector = 'meta[property="og:image"]';
    const seriesUrlSelector = 'link[rel="canonical"]';
    const seriesDescriptionSelector = '#collection_description';
    const seriesCreatorsSelector = '.series-common-atf .a-column.a-span8 a';

    imageUrl = await page.evaluate((selector) => {
      const url = document.querySelector(selector)?.getAttribute('content');
      return url?.replace('SY300', 'SY1000');
    }, imageUrlSelector);

    seriesPageUrl = await page.evaluate((selector) => {
      return document.querySelector(selector)?.getAttribute('href');
    }, seriesUrlSelector);

    seriesDescription = await page.evaluate((selector) => {
      return document.querySelector(selector)?.textContent;
    }, seriesDescriptionSelector);

    seriesCreators = await page.evaluate((selector) => {
      const creators = document.querySelectorAll(selector);
      const creatorsArray: Creator[] = [];
      creators.forEach((c, index) => {
        const creator = c?.textContent?.split(' (')[0];
        if (creator) {
          creatorsArray.push({ name: creator, role: '', order: index });
        }
      });
      return creatorsArray;
    }, seriesCreatorsSelector);

    const cuSelector = '#series-childAsin-item_1 ::-p-text(Read for Free)';
    try {
      const cuItem = await page.waitForSelector(cuSelector, { timeout: 1000 });
      if (cuItem) {
        withinCU = true;
      }
    } catch (e: any) {
      withinCU = false;
    }
  }

  await browser.close();

  return { imageUrl, seriesPageUrl, withinCU, seriesDescription, seriesCreators };
};
