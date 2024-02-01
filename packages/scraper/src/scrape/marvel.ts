import { logError } from '@justreadcomics/shared-node/dist/util/logger';
import { initScraperPage } from './util';
import { isProduction } from '@justreadcomics/common/dist/util/process';
import * as cheerio from 'cheerio';

export const scrapeMarvelSeries = async (seriesUrl: string, runHeadless?: boolean) => {
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  await page.goto(seriesUrl, { waitUntil: 'domcontentloaded' });

  const imageUrlSelector = 'meta[name="twitter:image"]';

  const descriptionSelector = '.featured-item-text .featured-item-desc p';

  await page.waitForSelector(descriptionSelector);

  const imageUrl = await page.evaluate((selector) => {
    const url = document.querySelector(selector)?.getAttribute('content');
    // !imageHref.match('image_not_available')
    return url?.match('image_not_available') ? undefined : url;
  }, imageUrlSelector);

  const description = await page.evaluate((selector) => {
    const featuredTexts = document.querySelectorAll(selector);
    if (featuredTexts?.length > 1) {
      return (featuredTexts?.[1] as HTMLParagraphElement)?.innerText.trim().slice(0, -5).trim();
    }
    return (featuredTexts?.[0] as HTMLParagraphElement)?.innerText.trim();
  }, descriptionSelector);

  await browser.close();

  return {
    date: new Date().toJSON(),
    imageUrl,
    description
  };
};

export const refreshMarvelMetadata = async (seriesUrl: string) => {
  // get html text from reddit
  const response = await fetch(seriesUrl);
  // using await to ensure that the promise resolves
  const body = await response.text();
  const $ = cheerio.load(body);

  const imageUrlSelector = 'meta[name="twitter:image"]';
  const descriptionSelector = '.featured-item-text .featured-item-desc p';

  const imageUrl = $(imageUrlSelector).attr('content');
  const description = $(descriptionSelector).text();
  console.log({ imageUrl, description });

  return { imageUrl, description };
};

/**
 * This is overkill, probably not usable
 * @param search
 * @param runHeadless
 */
export const scrapeAndSearchMarvel = async (search: string, runHeadless?: boolean) => {
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  const searchQuery = 'https://www.marvel.com/search?limit=1&query=%s&offset=0&content_type=comics'.replace(
    '%s',
    encodeURIComponent(search)
  );

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

interface IMassMarvelImport {
  seriesName: string;
  link: string;
  ongoing: boolean;
}

export const massImportMarvel = async (runHeadless?: boolean) => {
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  await page.goto('https://www.marvel.com/comics/series', { waitUntil: 'domcontentloaded' });

  try {
    await page.waitForSelector('.modu_AZ');

    const titlesLocator = '.modu_AZ .az-list';

    const snaggedTitles = await page.evaluate((selector) => {
      const titles: IMassMarvelImport[] = [];
      const documentSelector = document.querySelectorAll(selector);
      documentSelector.forEach((item) => {
        item.querySelectorAll('li a').forEach((el) => {
          const text = el.textContent;
          const link = el.getAttribute('href');
          const ongoing = el.parentElement?.tagName.toLowerCase() === 'b';

          if (text && text.length > 0 && link && link !== '#') {
            titles.push({ seriesName: text, link: `https://www.marvel.com${link}`, ongoing });
          }
        });
      });
      return titles;
    }, titlesLocator);

    await browser.close();

    return {
      series: snaggedTitles
    };
  } catch (e: any) {
    console.log(e);
    logError(e);
    return {
      series: [],
      error: e
    };
  }
};
