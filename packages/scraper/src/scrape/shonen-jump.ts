import { initScraperPage } from './util';
import { IShonenJumpSeries } from '@justreadcomics/common/dist/types/scraper';
import { isProduction } from '@justreadcomics/common/dist/util/process';
import { logError } from '@justreadcomics/common/dist/util/logger';

export const massImportShonenJump = async (runHeadless = true) => {
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  // this is kind of an okay url...
  await page.goto('https://www.viz.com/read/shonenjump/section/free-chapters', { waitUntil: 'domcontentloaded' });

  try {
    await page.waitForSelector('.property-row');

    const titlesLocator = '.property-row .p-cs-tile a.disp-bl';

    const snaggedTitles = await page.evaluate((selector) => {
      const titles: IShonenJumpSeries[] = [];
      const seriesDOM = document.querySelectorAll(selector);
      seriesDOM.forEach((series) => {
        const seriesLink = `https://www.viz.com${series.getAttribute('href')}`;
        const seriesName = series.querySelector('.type-center')?.textContent || '';

        let imageUrl = series.querySelector('img')?.getAttribute('src') || '';
        if (imageUrl?.match('placeholder')) {
          imageUrl = series.querySelector('img')?.getAttribute('data-original') || '';
        }
        titles.push({
          seriesLink,
          seriesName,
          imageUrl
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

export const scrapeShonenJumpSeries = async (seriesUrl: string, runHeadless = true) => {
  // modal-follow
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  await page.goto(seriesUrl, { waitUntil: 'domcontentloaded' });

  try {
    const modalId = '#modal-follow';

    const modalImage = '#modal-follow .modal-g-lg img';

    const seriesDescription = '#series-intro .type-lg--md.mar-t-rg';

    const description = await page.evaluate((selector) => {
      const text = document.querySelector(selector)?.textContent;
      return (text || '').trim();
    }, seriesDescription);

    const seriesCredits = '#series-intro .disp-bl--bm.mar-b-md';

    const creators = await page.evaluate((selector) => {
      const text = document.querySelector(selector)?.textContent;
      if (text) {
        const splitText = text.split('Created by ')[1];
        if (splitText) {
          return splitText.split(' and ');
        }
      }
      return [];
    }, seriesCredits);
    let imageUrl;
    try {
      const modal = await page.waitForSelector(modalId, { timeout: 1000 });
      if (modal) {
        imageUrl = await page.evaluate((selector) => {
          const image = document.querySelector(selector);
          return image?.getAttribute('src');
        }, modalImage);
      }
    } catch (e: any) {
      // try a cheeky way
      try {
        // grab the title
        const headerId = '#series-intro h2';
        const title = await page.evaluate((selector) => {
          const text = document.querySelector(selector)?.textContent;
          return (text || '').trim();
        }, headerId);

        // do an exact search
        const searchInput = await page.waitForSelector('#search-input');
        await searchInput?.type(title);
        await searchInput?.press('Enter');

        // snag the image from the first search result
        const searchResultImageSelector = '.section_properties .disp-bl img';
        await page.waitForSelector(searchResultImageSelector, { timeout: 1000 });
        imageUrl = await page.evaluate((selector) => {
          const image = document.querySelector(selector);
          const src = image?.getAttribute('src'); // data-original
          if (src?.match('placeholder')) {
            return image?.getAttribute('data-original');
          }
        }, searchResultImageSelector);
      } catch (e: any) {
        // skip
        console.log('no');
      }
    }

    return {
      imageUrl,
      description,
      creators
    };
  } catch (e: any) {
    console.log(e);
    logError(e);
    return {
      error: e
    };
  }
};
