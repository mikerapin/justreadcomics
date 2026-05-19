import { massImportShonenJump } from '../../scrape/shonen-jump';
import { initScraperPage } from '../../scrape/util';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

// Mock external dependencies
jest.mock('../../scrape/util', () => ({
  initScraperPage: jest.fn(),
  withRetry: jest.fn((fn: () => Promise<unknown>) => fn())
}));

jest.mock('@justreadcomics/shared-node/dist/util/logger', () => ({
  logError: jest.fn()
}));

describe('Shonen Jump Scrape', () => {
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

  describe('massImportShonenJump', () => {
    it('should successfully scrape Shonen Jump series data', async () => {
      // Mock successful page load and data extraction
      mockPage.waitForSelector.mockResolvedValue(true);
      mockPage.evaluate.mockImplementation((fn: () => any) => {
        // Simulate the evaluate function's behavior
        return [
          {
            seriesName: 'Test Shonen Jump Series 1',
            seriesLink: 'https://www.viz.com/read/shonenjump/series/1',
            imageUrl: 'https://example.com/image1.jpg'
          },
          {
            seriesName: 'Test Shonen Jump Series 2',
            seriesLink: 'https://www.viz.com/read/shonenjump/series/2',
            imageUrl: 'https://example.com/image2.jpg'
          }
        ];
      });

      const result = await massImportShonenJump(true);

      expect(initScraperPage).toHaveBeenCalledWith(true);
      expect(mockPage.goto).toHaveBeenCalledWith('https://www.viz.com/read/shonenjump/section/free-chapters', {
        waitUntil: 'domcontentloaded'
      });
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('.property-row');
      expect(result).toEqual({
        series: [
          {
            seriesName: 'Test Shonen Jump Series 1',
            seriesLink: 'https://www.viz.com/read/shonenjump/series/1',
            imageUrl: 'https://example.com/image1.jpg'
          },
          {
            seriesName: 'Test Shonen Jump Series 2',
            seriesLink: 'https://www.viz.com/read/shonenjump/series/2',
            imageUrl: 'https://example.com/image2.jpg'
          }
        ]
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle page load failure', async () => {
      const error = new Error('Page load failed');
      mockPage.waitForSelector.mockRejectedValue(error);

      const result = await massImportShonenJump(true);

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

      const result = await massImportShonenJump(true);

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
            seriesLink: 'https://www.viz.com/read/shonenjump/series/1',
            imageUrl: 'https://example.com/image1.jpg'
          },
          {
            seriesName: 'Test Shonen Jump Series 2',
            seriesLink: '', // Empty link should be filtered
            imageUrl: 'https://example.com/image2.jpg'
          }
        ];
      });

      const result = await massImportShonenJump(true);

      expect(result).toEqual({
        series: []
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
