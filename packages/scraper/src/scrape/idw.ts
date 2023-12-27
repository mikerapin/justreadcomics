import { IdwApiProduct, IdwApiResponse, ReturnMassProducts } from '@justreadcomics/common/dist/types/scraper';

/**
 * @deprecated Don't use this
 */
export const massImportIdw = async () => {
  // this one won't even need to use puppeteer

  const startApiUrl = `https://idwpublishing.com/collections/all-comics?view=api&sort_by=title-ascending&page=${1}`;

  const pageOne = (await fetch(startApiUrl).then((res) => res.json())) as IdwApiResponse;

  const pages = Math.floor(pageOne.products_count / pageOne.pagination_limit);

  let products: IdwApiProduct[] = [];
  for (let i = 1; i <= pages; i++) {
    // iterate through each page
    const apiUrl = `https://idwpublishing.com/collections/all-comics?view=api&sort_by=title-ascending&page=${i}`;
    const page = (await fetch(apiUrl).then((res) => res.json())) as IdwApiResponse;
    products = [...products, ...page.products];
  }

  const finalSeries: ReturnMassProducts[] = [];
  products
    .map((product) => {
      let title = product.title;
      if (product.type === 'Single Issue') {
        const dashIndex = title.indexOf(' - ');
        title = title.substring(0, dashIndex);
        const hashIndex = title.indexOf(' #');
        title = title.substring(0, hashIndex);
      }
      return {
        seriesName: title.trim(),
        description: product.description?.replace(/<\/?[^>]+>/gi, ''),
        seriesImage: `http:${product.featured_image}`,
        seriesLink: `https://idwpublishing.com/products/${product.handle}`
      };
    })
    .filter((product) => {
      const index = finalSeries.findIndex((p) => product.seriesName === p.seriesName);
      if (index === -1) {
        finalSeries.push(product);
      }
      return null;
    });

  return { series: finalSeries };
};
