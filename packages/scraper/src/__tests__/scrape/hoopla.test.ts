import { massImportHoopla } from '../../scrape/hoopla';
import { initScraperPage } from '../../scrape/util';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

// Mock external dependencies
jest.mock('../../scrape/util', () => ({
  initScraperPage: jest.fn()
}));

jest.mock('@justreadcomics/shared-node/dist/util/logger', () => ({
  logError: jest.fn()
}));

describe('Hoopla Scrape', () => {
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
      evaluate: jest.fn()
    };

    (initScraperPage as jest.Mock).mockResolvedValue({ page: mockPage, browser: mockBrowser });
  });

  describe('massImportHoopla', () => {
    it('should successfully scrape Hoopla series data', async () => {
      // Mock successful page load and data extraction
      mockPage.waitForSelector.mockResolvedValue(true);
      mockPage.evaluate.mockImplementation((fn: () => any) => {
        // Simulate the evaluate function's behavior
        return [
          {
            seriesName: 'Test Hoopla Series 1',
            seriesLink: 'https://www.hoopladigital.com/series/1',
            imageUrl: 'https://example.com/image1.jpg'
          },
          {
            seriesName: 'Test Hoopla Series 2',
            seriesLink: 'https://www.hoopladigital.com/series/2',
            imageUrl: 'https://example.com/image2.jpg'
          }
        ];
      });

      const result = await massImportHoopla(true);

      expect(initScraperPage).toHaveBeenCalledWith(true);
      expect(mockPage.goto).toHaveBeenCalledWith('https://www.hoopladigital.com/genre/Comics', {
        waitUntil: 'domcontentloaded'
      });
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('.series-list');
      expect(result).toEqual({
        series: [
          {
            seriesName: 'Test Hoopla Series 1',
            seriesLink: 'https://www.hoopladigital.com/series/1',
            imageUrl: 'https://example.com/image1.jpg'
          },
          {
            seriesName: 'Test Hoopla Series 2',
            seriesLink: 'https://www.hoopladigital.com/series/2',
            imageUrl: 'https://example.com/image2.jpg'
          }
        ]
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle page load failure', async () => {
      const error = new Error('Page load failed');
      mockPage.waitForSelector.mockRejectedValue(error);

      const result = await massImportHoopla(true);

      expect(logError).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        series: [],
        error
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle missing series data', async () => {
      mockPage.waitForSelector.mockResolvedValue(true);
      mockPage.evaluate.mockReturnValue([]);

      const result = await massImportHoopla(true);

      expect(result).toEqual({
        series: []
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle malformed series data', async () => {
      mockPage.waitForSelector.mockResolvedValue(true);
      mockPage.evaluate.mockImplementation((fn: () => any) => {
        // Return malformed data that should be filtered out
        return [
          {
            seriesName: '', // Empty name should be filtered
            seriesLink: 'https://www.hoopladigital.com/series/1',
            imageUrl: 'https://example.com/image1.jpg'
          },
          {
            seriesName: 'Test Hoopla Series 2',
            seriesLink: '', // Empty link should be filtered
            imageUrl: 'https://example.com/image2.jpg'
          }
        ];
      });

      const result = await massImportHoopla(true);

      expect(result).toEqual({
        series: []
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
