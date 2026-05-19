import { searchScrapeCorpo, refreshCorpoMetadata } from '../../scrape/corpo';
import { initScraperPage } from '../../scrape/util';
import { servicesModel } from '@justreadcomics/shared-node/dist/model/services';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';
import { Types } from 'mongoose';
import { CORPO_SERVICE_ID } from '@justreadcomics/common/dist/const';

// Mock external dependencies
jest.mock('../../scrape/util', () => ({
  initScraperPage: jest.fn(),
  withRetry: jest.fn((fn: () => Promise<unknown>) => fn())
}));

jest.mock('@justreadcomics/shared-node/dist/model/services', () => ({
  servicesModel: {
    findOne: jest.fn()
  }
}));

jest.mock('@justreadcomics/shared-node/dist/util/logger', () => ({
  logError: jest.fn()
}));

describe('Corpo Scrape', () => {
  let mockPage: any;
  let mockBrowser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock browser and page
    mockBrowser = {
      close: jest.fn()
    };

    mockPage = {
      goto: jest.fn(),
      waitForNavigation: jest.fn(),
      waitForSelector: jest.fn(),
      click: jest.fn(),
      evaluate: jest.fn(),
      hover: jest.fn()
    };

    (initScraperPage as jest.Mock).mockResolvedValue({ page: mockPage, browser: mockBrowser });
  });

  describe('searchScrapeCorpo', () => {
    it('should use fallback search URL when service is not found', async () => {
      (servicesModel.findOne as jest.Mock).mockResolvedValue(null);

      await searchScrapeCorpo('test series');

      expect(servicesModel.findOne).toHaveBeenCalledWith({ _id: new Types.ObjectId(CORPO_SERVICE_ID) });
      expect(mockPage.goto).toHaveBeenCalledWith('https://www.amazon.com/', { waitUntil: 'domcontentloaded' });
      expect(mockPage.goto).toHaveBeenCalledWith(
        'https://www.amazon.com/s?k=test%20series&i=comics-manga&rh=n%3A156104011%2Cp_n_feature_browse-bin%3A13684862011&test=1',
        { waitUntil: 'domcontentloaded' }
      );
    });

    it('should use service search URL when available', async () => {
      const mockService = {
        get: jest.fn().mockReturnValue('https://custom-search.com/%s')
      };
      (servicesModel.findOne as jest.Mock).mockResolvedValue(mockService);

      await searchScrapeCorpo('test series');

      expect(mockPage.goto).toHaveBeenCalledWith('https://custom-search.com/test%20series', {
        waitUntil: 'domcontentloaded'
      });
    });

    it('should handle successful series search', async () => {
      const mockPartOfLink = { click: jest.fn() };
      mockPage.waitForSelector.mockResolvedValue(mockPartOfLink);
      mockPage.evaluate.mockImplementation((fn: (selector: string) => any, selector: string) => {
        if (selector === 'meta[property="og:image"]') return 'http://test.com/image.jpg';
        if (selector === 'link[rel="canonical"]') return 'http://test.com/series';
        if (selector === '#collection_description') return 'Test description';
        if (selector === '#collection-title') return 'Test Series';
        return [];
      });

      const result = await searchScrapeCorpo('test series');

      expect(result).toEqual({
        imageUrl: 'http://test.com/image.jpg',
        seriesPageUrl: 'http://test.com/series',
        withinCU: true,
        seriesDescription: 'Test description',
        seriesCredits: [],
        seriesName: 'Test Series'
      });
    });

    it('should handle series not found', async () => {
      mockPage.waitForSelector.mockResolvedValue(null);

      const result = await searchScrapeCorpo('test series');

      expect(result).toEqual({
        imageUrl: undefined,
        seriesPageUrl: undefined,
        withinCU: undefined,
        seriesDescription: undefined,
        seriesCredits: undefined,
        seriesName: undefined
      });
    });

    it('should handle scraping errors', async () => {
      const error = new Error('Scraping failed');
      mockPage.waitForSelector.mockRejectedValue(error);

      const result = await searchScrapeCorpo('test series');

      expect(logError).toHaveBeenCalledWith('unable to find or load dom queries');
      expect(result).toEqual({
        imageUrl: undefined,
        seriesPageUrl: undefined,
        withinCU: undefined,
        seriesDescription: undefined,
        seriesCredits: undefined,
        seriesName: undefined
      });
    });
  });

  describe('refreshCorpoMetadata', () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully refresh metadata', async () => {
      const mockHtml = `
        <html>
          <head>
            <meta property="og:image" content="http://test.com/image.jpg" />
            <link rel="canonical" href="http://test.com/series" />
          </head>
          <body>
            <h1 id="collection-title">Test Series</h1>
            <div id="collection_description">Test description</div>
            <div id="contributor-link">
              <a>Creator 1 (Writer)</a>
              <a>Creator 2 (Artist)</a>
            </div>
            <div aria-label="Read for Free"></div>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValue({
        text: () => Promise.resolve(mockHtml)
      });

      const result = await refreshCorpoMetadata('http://test.com/series');

      expect(result).toEqual({
        imageUrl: 'http://test.com/image.jpg',
        seriesPageUrl: undefined,
        seriesName: 'Test Series',
        description: 'Test description',
        credits: [
          { name: 'Creator 1', role: 'Writer' },
          { name: 'Creator 2', role: 'Artist' }
        ],
        withinCU: true
      });
    });

    it('should handle malformed HTML', async () => {
      mockFetch.mockResolvedValue({
        text: () => Promise.resolve('<html><body>Invalid HTML</body></html>')
      });

      const result = await refreshCorpoMetadata('http://test.com/series');

      expect(result).toEqual({
        imageUrl: undefined,
        seriesPageUrl: undefined,
        seriesName: '',
        description: '',
        credits: [],
        withinCU: false
      });
    });
  });
});
