import { initScraperPage, cleanSearch } from '../util';
import puppeteer from 'puppeteer';

// Mock puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn()
}));

describe('Scraper Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initScraperPage', () => {
    it('should initialize a headless browser by default', async () => {
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          on: jest.fn(),
          setViewport: jest.fn()
        })
      };

      (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

      const result = await initScraperPage();

      expect(puppeteer.launch).toHaveBeenCalledWith({ headless: true });
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(result.browser).toBe(mockBrowser);
      expect(result.page).toBeDefined();
    });

    it('should initialize a non-headless browser when specified', async () => {
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          on: jest.fn(),
          setViewport: jest.fn()
        })
      };

      (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

      const result = await initScraperPage(false);

      expect(puppeteer.launch).toHaveBeenCalledWith({ headless: false });
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(result.browser).toBe(mockBrowser);
      expect(result.page).toBeDefined();
    });

    it('should set up error handling on the page', async () => {
      const mockPage = {
        on: jest.fn(),
        setViewport: jest.fn()
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage)
      };

      (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await initScraperPage();

      expect(mockPage.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should set the viewport size', async () => {
      const mockPage = {
        on: jest.fn(),
        setViewport: jest.fn()
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage)
      };

      (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await initScraperPage();

      expect(mockPage.setViewport).toHaveBeenCalledWith({
        width: 1280,
        height: 720
      });
    });

    it('should handle browser launch errors', async () => {
      (puppeteer.launch as jest.Mock).mockRejectedValue(new Error('Launch failed'));

      await expect(initScraperPage()).rejects.toThrow('Launch failed');
    });
  });

  describe('cleanSearch', () => {
    it('should remove text in parentheses', () => {
      expect(cleanSearch('Test Series (2023)')).toBe('Test Series');
    });

    it('should handle multiple parentheses', () => {
      expect(cleanSearch('Test Series (2023) (Limited)')).toBe('Test Series');
    });

    it('should handle nested parentheses', () => {
      expect(cleanSearch('Test Series (2023 (Limited))')).toBe('Test Series');
    });

    it('should handle empty parentheses', () => {
      expect(cleanSearch('Test Series ()')).toBe('Test Series');
    });

    it('should handle no parentheses', () => {
      expect(cleanSearch('Test Series')).toBe('Test Series');
    });

    it('should handle empty string', () => {
      expect(cleanSearch('')).toBe('');
    });

    it('should handle string with only parentheses', () => {
      expect(cleanSearch('()')).toBe('');
    });

    it('should preserve spaces around parentheses', () => {
      expect(cleanSearch('Test Series (2023) More Text')).toBe('Test Series More Text');
    });
  });
});
