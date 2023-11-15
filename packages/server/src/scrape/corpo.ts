import { cleanSearch, initScraperPage } from './util';

export const searchScrapeCorpo = async (search: string, headless?: boolean) => {
  const { page, browser } = await initScraperPage(headless);

  const cleanedSearch = cleanSearch(search);

  const searchQuery = 'https://www.amazon.com/s?k=%s&i=comics-manga&rh=n%3A156104011%2Cp_n_feature_browse-bin%3A13684862011'.replace(
    '%s',
    encodeURIComponent(cleanedSearch)
  );

  await page.goto(searchQuery, { waitUntil: 'domcontentloaded' });

  // const firstSearchResultSelector = 'div.s-search-results ::-p-text(Kindle Edition)';

  let imageUrl;
  let seriesPageUrl;
  let withinCU;

  const partOfLinkSelector = '.s-search-results .s-widget-container ::-p-text(Part of)';

  const partOfLink = await page.waitForSelector(partOfLinkSelector);
  if (partOfLink) {
    await partOfLink.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const imageUrlSelector = 'meta[property="og:image"]';
    const seriesUrlSelector = 'link[rel="canonical"]';

    imageUrl = await page.evaluate((selector) => {
      const url = document.querySelector(selector)?.getAttribute('content');
      return url?.replace('SY300', 'SY1000');
    }, imageUrlSelector);

    seriesPageUrl = await page.evaluate((selector) => {
      return document.querySelector(selector)?.getAttribute('href');
    }, seriesUrlSelector);

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

  return { imageUrl, seriesPageUrl, withinCU };
};
