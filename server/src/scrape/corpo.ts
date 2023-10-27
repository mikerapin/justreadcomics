import { initScraperPage } from './util';

export const searchCorpo = async (search: string, headless?: boolean) => {
  const { page, browser } = await initScraperPage(headless);

  const searchQuery = 'https://www.amazon.com/s?k=%s&i=comics-manga&rh=n%3A156104011%2Cp_n_feature_browse-bin%3A13684862011'.replace(
    '%s',
    encodeURIComponent(search)
  );

  await page.goto(searchQuery, { waitUntil: 'domcontentloaded' });

  const firstSearchResultSelector = 'div.s-search-results ::-p-text(Kindle Edition)';

  // https://www.amazon.com/s?k=Criminal+%282008%29&i=comics-manga&rh=n%3A156104011%2Cp_n_feature_browse-bin%3A13684862011&dc&ds=v1%3AIHV8cfH1ANHq%2BsPATeCweSWDsalcLIgE3Ou5lVGzdHg&crid=1CHBH077G626J&qid=1698362483&rnid=13684861011&sprefix=criminal+2008+%2Ccomics-manga%2C65&ref=sr_nr_p_n_feature_browse-bin_1
  // https://www.amazon.com/s?k=Criminal+%282008%29&i=comics-manga&ds=v1:IHV8cfH1ANHq+sPATeCweSWDsalcLIgE3Ou5lVGzdHg
  //
  // await page.waitForSelector(firstSearchResultSelector + ' ::-p-text(comic series)');
  //
  // // cap the image
  // const filteredUrl = await page.evaluate((sel) => {
  //   return document?.querySelector(sel)?.getAttribute('href');
  // }, firstSearchResultSelector);
  //
  // if (!filteredUrl) {
  //   await browser.close();
  //   return { error: 'no results, sorry' };
  // }
  //
  // // auto filter the results to MU books
  // await page.goto(filteredUrl + '?isDigital=1', { waitUntil: 'domcontentloaded' });
  //
  // const imageSelector = '.row-item-image img';
  //
  // // wait for the next page to load
  // await page.waitForSelector(imageSelector);
  //
  // // cap the image
  // const imageHref = await page.evaluate((sel) => {
  //   return document?.querySelector(sel)?.getAttribute('src');
  // }, imageSelector);
  //
  // if (imageHref && !imageHref.match('image_not_available')) {
  //   console.log('savin it');
  // } else {
  //   // try to get the first image from the first issue
  // }
  //
  // await page.waitForSelector('.filterResultsText');
  // const filterResultsText = await page.$('.filterResultsText');
  // const value = await page.evaluate((el) => el?.textContent || '0', filterResultsText);
  // const muResults = value.match(/[0-9]+/g)?.[0] || 0;
  //
  // // // filter MU results
  // // const isDigitalFilter = await page.waitForSelector('label[for="isDigital"]');
  // // if (isDigitalFilter) {
  // //   // trigger the filter
  // //   await isDigitalFilter.click();
  // // }

  // Close browser.
  await browser.close();

  return { msg: 'cool', results: {} };
};
