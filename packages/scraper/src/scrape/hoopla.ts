import { initScraperPage } from './util';
import { isProduction } from '@justreadcomics/common/dist/util/process';
import { servicesModel } from '@justreadcomics/shared-node/dist/model/services';
import { Types } from 'mongoose';
import { HOOPLA_SERVICE_ID } from '@justreadcomics/common/dist/const';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

export const searchScrapeHoopla = async (
  searchValue: string,
  {
    fetchMetaData = false,
    runHeadless = false
  }: {
    fetchMetaData?: boolean;
    runHeadless?: boolean;
  }
) => {
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  const service = await servicesModel.findOne({ _id: new Types.ObjectId(HOOPLA_SERVICE_ID) });

  if (!service) {
    logError('service not found, wtf?');
    return {};
  }

  const searchUrl = service.get('searchUrl');

  const searchQuery = searchUrl.replace('%s', encodeURIComponent(searchValue));

  let seriesPageUrl;

  try {
    // await page.goto('https://hoopladigital.com/', { waitUntil: 'domcontentloaded' });
    // await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.goto(searchQuery, { waitUntil: 'domcontentloaded' });
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await new Promise((r) => setTimeout(r, 3000));

    const searchResultsSelector = '.flex.flex-1.flex-col.space-y-2 .grid a';
    const pillSelector = '.overflow-hidden.text-ellipsis.whitespace-nowrap';

    await page.waitForSelector(pillSelector);

    const results: string[] = await page.evaluate(
      (selector, searchValue) => {
        const resultLinks: string[] = [];
        const links: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(selector);
        const titleRegex = new RegExp(searchValue, 'gi');
        links.forEach((link) => {
          const linkHref = link.getAttribute('href');
          if (linkHref && link.getAttribute('title')?.match(titleRegex)) {
            resultLinks.push(`https://www.hoopladigital.com${linkHref}`);
          }
        });
        return resultLinks;
      },
      searchResultsSelector,
      searchValue
    );

    if (!results.length) {
      logError('no results dude');
      return {};
    }

    console.log({ results });

    await page.goto(results[0], { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 3000));

    // Part 2 of the Time Before Time series
    const partOfLinkSelector = `.flex.flex-1.flex-col.space-y-2 ::-p-text(of the ${searchValue} series) a`;
    const partOfLink = await page.waitForSelector(partOfLinkSelector, { timeout: 3000 });
    if (partOfLink) {
      seriesPageUrl = await page
        .locator(partOfLinkSelector)
        .map((link) => link.getAttribute('href'))
        .wait();

      seriesPageUrl = `https://www.hoopladigital.com${seriesPageUrl}`;

      if (fetchMetaData) {
        /*
  
      let seriesName;
      let imageUrl;
      let seriesDescription;
      let seriesCredits;
         */
        // parse the metadata on this page and return it
      }
    }
  } catch (e: any) {
    logError('unable to find or load dom queries');
    console.log(e);
  }

  await browser.close();

  return {
    seriesPageUrl
  };
};
