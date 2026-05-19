import { initScraperPage, withRetry } from './util';
import { isProduction } from '@justreadcomics/common/dist/util/process';
import { servicesModel } from '@justreadcomics/shared-node/dist/model/services';
import { Types } from 'mongoose';
import { HOOPLA_SERVICE_ID } from '@justreadcomics/common/dist/const';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

// hoopla requires puppeteer because it's dynamically loaded via Javascript
//  this may be avoidable by using a plugin for cheerio...
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

    await withRetry(() => page.goto(searchQuery, { waitUntil: 'domcontentloaded' }));
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

    await withRetry(() => page.goto(results[0], { waitUntil: 'domcontentloaded' }));
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
  } catch (e: unknown) {
    logError('unable to find or load dom queries');
    console.log(e);
  }

  await browser.close();

  return {
    seriesPageUrl
  };
};

interface IHooplaSeries {
  seriesName: string;
  seriesLink: string;
  imageUrl: string;
}

export const massImportHoopla = async (runHeadless = true) => {
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  try {
    await withRetry(() => page.goto('https://www.hoopladigital.com/genre/Comics', { waitUntil: 'domcontentloaded' }));
    await page.waitForSelector('.series-list');

    const titlesLocator = '.series-list .series-item';

    const snaggedTitles = await page.evaluate((selector) => {
      const titles: IHooplaSeries[] = [];
      const seriesItems = document.querySelectorAll(selector);

      seriesItems.forEach((item) => {
        const linkElement = item.querySelector('a.series-link') as HTMLAnchorElement;
        const nameElement = item.querySelector('.series-title') as HTMLElement;
        const imageElement = item.querySelector('img.series-cover') as HTMLImageElement;

        if (linkElement && nameElement && imageElement) {
          const seriesLink = linkElement.getAttribute('href') || '';
          const seriesName = nameElement.textContent || '';
          const imageUrl = imageElement.getAttribute('src') || '';

          if (seriesLink && seriesName) {
            titles.push({
              seriesName,
              seriesLink: `https://www.hoopladigital.com${seriesLink}`,
              imageUrl
            });
          }
        }
      });

      return titles;
    }, titlesLocator);

    await browser.close();

    // Filter out any malformed data that might have slipped through
    const filteredTitles = snaggedTitles.filter(
      (series) => series.seriesName && series.seriesLink && series.seriesName.length > 0 && series.seriesLink.length > 0
    );

    return {
      series: filteredTitles
    };
  } catch (e: unknown) {
    logError(e);
    await browser.close();
    return {
      series: [],
      error: e
    };
  }
};
