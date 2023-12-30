import { cleanSearch, initScraperPage } from './util';
import { isProduction } from '@justreadcomics/common/dist/util/process';
import { Creator } from '@justreadcomics/common/dist/types/series';
import { logError } from '@justreadcomics/common/dist/util/logger';
import { Types } from 'mongoose';
import { servicesModel } from '@justreadcomics/common/dist/model/services';
import { CORPO_SERVICE_ID } from '@justreadcomics/common/dist/const';

const FALLBACK_SEARCH =
  'https://www.amazon.com/s?k=%s&i=comics-manga&rh=n%3A156104011%2Cp_n_feature_browse-bin%3A13684862011&test=1';

export const searchScrapeCorpo = async (search: string, runHeadless?: boolean) => {
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  const service = await servicesModel.findOne({ _id: new Types.ObjectId(CORPO_SERVICE_ID) });

  const searchUrl = service?.get('searchUrl') || FALLBACK_SEARCH;

  const searchQuery = searchUrl.replace('%s', encodeURIComponent(search));

  await page.goto(searchQuery, { waitUntil: 'domcontentloaded' });

  // const firstSearchResultSelector = 'div.s-search-results ::-p-text(Kindle Edition)';

  let seriesName;
  let imageUrl;
  let seriesPageUrl;
  let seriesDescription;
  let seriesCredits;
  let withinCU;

  const partOfLinkSelector = '.s-search-results .s-widget-container ::-p-text(Part of)';

  try {
    const partOfLink = await page.waitForSelector(partOfLinkSelector, { timeout: 3000 });
    if (partOfLink) {
      await partOfLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      const imageUrlSelector = 'meta[property="og:image"]';
      const seriesUrlSelector = 'link[rel="canonical"]';
      const seriesNameSelector = '#collection-title';
      const seriesDescriptionSelector = '#collection_description';
      const seriesCreditsSelector = '.series-common-atf .a-column.a-span8 a';

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

      seriesName = await page.evaluate((selector) => {
        return document.querySelector(selector)?.textContent;
      }, seriesNameSelector);

      seriesCredits = await page.evaluate((selector) => {
        const creators = document.querySelectorAll(selector);
        const creatorsArray: Creator[] = [];
        creators.forEach((c, index) => {
          const creator = c?.textContent?.split(' (')[0];
          if (creator) {
            creatorsArray.push({ name: creator, role: '', order: index });
          }
        });
        return creatorsArray;
      }, seriesCreditsSelector);

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
  } catch (e: any) {
    logError('unable to find or load dom queries');
  }

  await browser.close();
  return { imageUrl, seriesPageUrl, withinCU, seriesDescription, seriesCredits, seriesName };
};
