import { massImageImport } from '../../scrape/image';
import { initScraperPage } from '../../scrape/util';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

// Mock external dependencies
jest.mock('../../scrape/util', () => ({
  initScraperPage: jest.fn()
}));

jest.mock('@justreadcomics/shared-node/dist/util/logger', () => ({
  logError: jest.fn()
}));

describe('Image Comics Scrape', () => {
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

  describe('massImageImport', () => {
    it('should successfully scrape Image Comics series data', async () => {
      // Mock successful page load and data extraction
      mockPage.waitForSelector.mockResolvedValue(true);
      mockPage.evaluate.mockImplementation((fn: () => any) => {
        // Simulate the evaluate function's behavior
        return [
          {
            seriesName: 'Test Image Series 1',
            seriesLink: 'https://imagecomics.com/comics/series/test-1'
          },
          {
            seriesName: 'Test Image Series 2',
            seriesLink: 'https://imagecomics.com/comics/series/test-2'
          }
        ];
      });

      const result = await massImageImport(true);

      expect(initScraperPage).toHaveBeenCalledWith(true);
      expect(mockPage.goto).toHaveBeenCalledWith('https://imagecomics.com/comics/series', {
        waitUntil: 'domcontentloaded'
      });
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('.all-series');
      expect(result).toEqual({
        series: [
          {
            seriesName: 'Test Image Series 1',
            seriesLink: 'https://imagecomics.com/comics/series/test-1'
          },
          {
            seriesName: 'Test Image Series 2',
            seriesLink: 'https://imagecomics.com/comics/series/test-2'
          }
        ]
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle page load failure', async () => {
      const error = new Error('Page load failed');
      mockPage.waitForSelector.mockRejectedValue(error);

      const result = await massImageImport(true);

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

      const result = await massImageImport(true);

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
            seriesLink: 'https://imagecomics.com/comics/series/test-1'
          },
          {
            seriesName: 'Test Image Series 2',
            seriesLink: '' // Empty link should be filtered
          }
        ];
      });

      const result = await massImageImport(true);

      expect(result).toEqual({
        series: []
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
