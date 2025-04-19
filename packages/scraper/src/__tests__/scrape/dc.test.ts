import { massDcImport } from '../../scrape/dc';
import { initScraperPage } from '../../scrape/util';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

// Mock external dependencies
jest.mock('../../scrape/util', () => ({
  initScraperPage: jest.fn()
}));

jest.mock('@justreadcomics/shared-node/dist/util/logger', () => ({
  logError: jest.fn()
}));

describe('DC Scrape', () => {
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
      waitForSelector: jest.fn(),
      waitForRequest: jest.fn(),
      evaluate: jest.fn()
    };

    (initScraperPage as jest.Mock).mockResolvedValue({ page: mockPage, browser: mockBrowser });
  });

  describe('massDcImport', () => {
    it('should successfully scrape DC series data', async () => {
      // Mock successful page load and data extraction
      mockPage.waitForSelector.mockResolvedValue(true);
      mockPage.waitForRequest.mockResolvedValue(true);
      mockPage.evaluate.mockImplementation((fn: () => any) => {
        // Simulate the evaluate function's behavior
        const mockSeriesData = [
          {
            seriesLink: 'https://www.dcuniverseinfinite.com/series/1',
            seriesName: 'Test Series 1',
            ongoing: true,
            seriesImage: 'https://example.com/image1.jpg'
          },
          {
            seriesLink: 'https://www.dcuniverseinfinite.com/series/2',
            seriesName: 'Test Series 2',
            ongoing: false,
            seriesImage: 'https://example.com/image2.jpg'
          }
        ];
        return mockSeriesData;
      });

      const result = await massDcImport(true);

      expect(initScraperPage).toHaveBeenCalledWith(true);
      expect(mockPage.goto).toHaveBeenCalledWith(
        'https://www.dcuniverseinfinite.com/browse/comics?sort=eyJkZWZhdWx0IjpmYWxzZSwiZGlyZWN0aW9uIjoiYXNjIiwiZmllbGQiOiJ0aXRsZSJ9&category=W10%3D&page=100&series',
        { waitUntil: 'domcontentloaded' }
      );
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('.browse-results__container');
      expect(mockPage.waitForRequest).toHaveBeenCalledWith(
        'https://cdn.cookielaw.org/consent/e7d1c260-e31e-4b31-a120-7cf7fef9bf33/36d5a1f4-82c8-4b94-85ff-b861c862f807/en.json'
      );
      expect(result).toEqual({
        series: [
          {
            seriesLink: 'https://www.dcuniverseinfinite.com/series/1',
            seriesName: 'Test Series 1',
            ongoing: true,
            seriesImage: 'https://example.com/image1.jpg'
          },
          {
            seriesLink: 'https://www.dcuniverseinfinite.com/series/2',
            seriesName: 'Test Series 2',
            ongoing: false,
            seriesImage: 'https://example.com/image2.jpg'
          }
        ]
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle page load failure', async () => {
      const error = new Error('Page load failed');
      mockPage.waitForSelector.mockRejectedValue(error);

      const result = await massDcImport(true);

      expect(logError).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        series: [],
        error
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle missing series data', async () => {
      mockPage.waitForSelector.mockResolvedValue(true);
      mockPage.waitForRequest.mockResolvedValue(true);
      mockPage.evaluate.mockReturnValue([]);

      const result = await massDcImport(true);

      expect(result).toEqual({
        series: []
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle malformed series data', async () => {
      mockPage.waitForSelector.mockResolvedValue(true);
      mockPage.waitForRequest.mockResolvedValue(true);
      mockPage.evaluate.mockImplementation((fn: () => any) => {
        // Return malformed data that should be filtered out
        return [
          {
            seriesLink: 'https://www.dcuniverseinfinite.com/series/1',
            seriesName: '', // Empty name should be filtered
            ongoing: true,
            seriesImage: 'https://example.com/image1.jpg'
          },
          {
            seriesLink: '', // Empty link should be filtered
            seriesName: 'Test Series 2',
            ongoing: false,
            seriesImage: 'https://example.com/image2.jpg'
          }
        ];
      });

      const result = await massDcImport(true);

      expect(result).toEqual({
        series: []
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
