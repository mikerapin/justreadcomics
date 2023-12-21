import { initScraperPage } from './util';
import { isProduction } from '@justreadcomics/common/dist/util/process';
import { IMassDcImport } from '@justreadcomics/common/dist/types/scraper';
import { logError } from '@justreadcomics/common/dist/util/logger';

export const massDcImport = async (runHeadless: boolean) => {
  const { page, browser } = await initScraperPage(runHeadless || isProduction());

  // this is the DC series list page, but it's a search page?
  // either way, it's loading 100 pages of all comic series sorted by title
  await page.goto(
    'https://www.dcuniverseinfinite.com/browse/comics?sort=eyJkZWZhdWx0IjpmYWxzZSwiZGlyZWN0aW9uIjoiYXNjIiwiZmllbGQiOiJ0aXRsZSJ9&category=W10%3D&page=100&series',
    { waitUntil: 'domcontentloaded' }
  );

  try {
    await page.waitForSelector('.browse-results__container');
    // waiting for this request ensures the page has fully loaded its ajax content
    await page.waitForRequest(
      'https://cdn.cookielaw.org/consent/e7d1c260-e31e-4b31-a120-7cf7fef9bf33/36d5a1f4-82c8-4b94-85ff-b861c862f807/en.json'
    );

    // get series blocks selector
    const titlesLocator = '.browse-results__container div .thumbnail-square';

    const snaggedTitles = await page.evaluate((selector) => {
      const seriesData: IMassDcImport[] = [];

      const thumbnailBlocks = document.querySelectorAll(selector);

      thumbnailBlocks.forEach((block) => {
        const coverImageLink = 'span a';
        const coverImagePicture = 'picture img';
        const seriesTitleSelector = '.thumbnail__description-container .thumbnail__title';

        const seriesLinkSelector = block.querySelector(coverImageLink) as HTMLImageElement;
        const coverImageSelector = block.querySelector(coverImagePicture) as HTMLImageElement;
        const seriesTitleBlock = block.querySelector(seriesTitleSelector) as HTMLHeadingElement;

        const seriesLink = seriesLinkSelector.getAttribute('href');
        const seriesImageSrc = coverImageSelector.getAttribute('src');
        const seriesName = seriesTitleBlock.innerText;

        const seriesImageUrl = seriesImageSrc && !seriesImageSrc.includes('bg_placeholder') ? seriesImageSrc : '';
        let seriesImage = '';
        if (seriesImageUrl.length) {
          const url = new URL(seriesImageUrl);
          url.search = '';

          seriesImage = url.toString();
        }

        if (seriesLink && seriesName) {
          seriesData.push({
            seriesLink: `https://www.dcuniverseinfinite.com${seriesLink}`,
            seriesName,
            ongoing: seriesName.includes('-)'),
            seriesImage
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
