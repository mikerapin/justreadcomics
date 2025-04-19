import { IdwApiProduct, IdwApiResponse, ReturnMassProducts } from '@justreadcomics/common/dist/types/scraper';

/**
 * @deprecated Don't use this
 */
export const massImportIdw = async () => {
  try {
    // this one won't even need to use puppeteer
    const startApiUrl = `https://idwpublishing.com/collections/all-comics?view=api&sort_by=title-ascending&page=${1}`;

    const response = await fetch(startApiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const pageOne = (await response.json()) as IdwApiResponse;

    if (!pageOne.products || !pageOne.products_count || !pageOne.pagination_limit) {
      return { series: [] };
    }

    const pages = Math.ceil(pageOne.products_count / pageOne.pagination_limit);

    let products: IdwApiProduct[] = [...pageOne.products];
    for (let i = 2; i <= pages; i++) {
      // iterate through each page
      const apiUrl = `https://idwpublishing.com/collections/all-comics?view=api&sort_by=title-ascending&page=${i}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        continue;
      }
      const page = (await response.json()) as IdwApiResponse;
      if (page.products) {
        products = [...products, ...page.products];
      }
    }

    const processedProducts = products.map((product) => {
      let title = product.title;
      if (product.type === 'Single Issue') {
        const dashIndex = title.indexOf(' - ');
        if (dashIndex !== -1) {
          title = title.substring(0, dashIndex);
        }
        const hashIndex = title.indexOf(' #');
        if (hashIndex !== -1) {
          title = title.substring(0, hashIndex);
        }
      }
      return {
        seriesName: title.trim(),
        description: product.description?.replace(/<\/?[^>]+>/gi, ''),
        seriesImage: product.featured_image?.startsWith('//')
          ? `http:${product.featured_image}`
          : product.featured_image,
        seriesLink: `https://idwpublishing.com/products/${product.handle}`
      };
    });

    // Deduplicate series based on series name
    const finalSeries = processedProducts.reduce((acc: ReturnMassProducts[], curr) => {
      if (!acc.some((item) => item.seriesName === curr.seriesName)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    return { series: finalSeries };
  } catch (error) {
    console.error('Error in massImportIdw:', error);
    return { series: [] };
  }
};
