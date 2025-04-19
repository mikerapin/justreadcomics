import { massImportMarvel } from '../../scrape/marvel';
import { initScraperPage } from '../../scrape/util';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

// Mock external dependencies
jest.mock('../../scrape/util', () => ({
  initScraperPage: jest.fn()
}));

jest.mock('@justreadcomics/shared-node/dist/util/logger', () => ({
  logError: jest.fn()
}));

describe('Marvel Scrape', () => {
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

  describe('massImportMarvel', () => {
    it('should successfully scrape Marvel series data', async () => {
      // Mock successful page load and data extraction
      mockPage.waitForSelector.mockResolvedValue(true);
      mockPage.evaluate.mockImplementation((fn: () => any) => {
        // Simulate the evaluate function's behavior
        return [
          {
            seriesName: 'Test Marvel Series 1',
            link: 'https://www.marvel.com/comics/series/1',
            ongoing: true
          },
          {
            seriesName: 'Test Marvel Series 2',
            link: 'https://www.marvel.com/comics/series/2',
            ongoing: false
          }
        ];
      });

      const result = await massImportMarvel(true);

      expect(initScraperPage).toHaveBeenCalledWith(true);
      expect(mockPage.goto).toHaveBeenCalledWith('https://www.marvel.com/comics/series', {
        waitUntil: 'domcontentloaded'
      });
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('.modu_AZ');
      expect(result).toEqual({
        series: [
          {
            seriesName: 'Test Marvel Series 1',
            link: 'https://www.marvel.com/comics/series/1',
            ongoing: true
          },
          {
            seriesName: 'Test Marvel Series 2',
            link: 'https://www.marvel.com/comics/series/2',
            ongoing: false
          }
        ]
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle page load failure', async () => {
      const error = new Error('Page load failed');
      mockPage.waitForSelector.mockRejectedValue(error);

      const result = await massImportMarvel(true);

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

      const result = await massImportMarvel(true);

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
            link: 'https://www.marvel.com/comics/series/1',
            ongoing: true
          },
          {
            seriesName: 'Test Marvel Series 2',
            link: '', // Empty link should be filtered
            ongoing: false
          }
        ];
      });

      const result = await massImportMarvel(true);

      expect(result).toEqual({
        series: []
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
