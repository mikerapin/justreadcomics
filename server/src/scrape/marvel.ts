// Import puppeteer
import { initScraperPage } from './util';

export const searchMarvel = async (search: string, headless?: boolean) => {
  const { page, browser } = await initScraperPage(headless);

  const searchQuery = 'https://www.marvel.com/search?limit=1&query=%s&offset=0&content_type=comics'.replace('%s', encodeURIComponent(search));

  await page.goto(searchQuery, { waitUntil: 'domcontentloaded' });

  const firstSearchResultSelector = '.search-list a.card-body__content-type';

  await page.waitForSelector(firstSearchResultSelector + ' ::-p-text(comic series)');

  // cap the image
  const filteredUrl = await page.evaluate((sel) => {
    return document?.querySelector(sel)?.getAttribute('href');
  }, firstSearchResultSelector);

  if (!filteredUrl) {
    await browser.close();
    return { error: 'no results, sorry' };
  }

  // auto filter the results to MU books
  await page.goto(filteredUrl + '?isDigital=1', { waitUntil: 'domcontentloaded' });

  const imageSelector = '.row-item-image img';

  // wait for the next page to load
  await page.waitForSelector(imageSelector);

  // cap the image
  const imageHref = await page.evaluate((sel) => {
    return document?.querySelector(sel)?.getAttribute('src');
  }, imageSelector);

  if (imageHref && !imageHref.match('image_not_available')) {
    console.log('savin it');
  } else {
    // try to get the first image from the first issue
  }

  await page.waitForSelector('.filterResultsText');
  const filterResultsText = await page.$('.filterResultsText');
  const value = await page.evaluate((el) => el?.textContent || '0', filterResultsText);
  const muResults = value.match(/[0-9]+/g)?.[0] || 0;

  // // filter MU results
  // const isDigitalFilter = await page.waitForSelector('label[for="isDigital"]');
  // if (isDigitalFilter) {
  //   // trigger the filter
  //   await isDigitalFilter.click();
  // }

  // Close browser.
  await browser.close();

  return { msg: 'cool', results: { imageHref, muResults } };
};
