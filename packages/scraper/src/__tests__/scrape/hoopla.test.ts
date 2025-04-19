import { massImportHoopla } from '../hoopla';
import { initScraperPage } from '../util';
import { isProduction } from '@justreadcomics/common/dist/util/process';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

jest.mock('../util');
jest.mock('@justreadcomics/common/dist/util/process');
jest.mock('@justreadcomics/shared-node/dist/util/logger');

describe('Hoopla Scraper', () => {
  const mockPage = {
    goto: jest.fn(),
    waitForSelector: jest.fn(),
    evaluate: jest.fn()
  };

  const mockBrowser = {
    close: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (initScraperPage as jest.Mock).mockResolvedValue({ page: mockPage, browser: mockBrowser });
    (isProduction as jest.Mock).mockReturnValue(false);
  });

  it('should successfully scrape Hoopla comics', async () => {
    const mockSeries = [
      {
        seriesName: 'Test Series 1',
        seriesLink: '/series/1',
        imageUrl: 'https://example.com/image1.jpg'
      },
      {
        seriesName: 'Test Series 2',
        seriesLink: '/series/2',
        imageUrl: 'https://example.com/image2.jpg'
      }
    ];

    mockPage.evaluate.mockResolvedValue(mockSeries);

    const result = await massImportHoopla(false);

    expect(initScraperPage).toHaveBeenCalledWith(false);
    expect(mockPage.goto).toHaveBeenCalledWith('https://www.hoopladigital.com/genre/Comics', {
      waitUntil: 'domcontentloaded'
    });
    expect(mockPage.waitForSelector).toHaveBeenCalledWith('.series-list');
    expect(mockPage.evaluate).toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalled();
    expect(result).toEqual({
      series: mockSeries
    });
  });

  it('should filter out malformed data', async () => {
    const mockSeries = [
      {
        seriesName: 'Valid Series',
        seriesLink: '/series/1',
        imageUrl: 'https://example.com/image1.jpg'
      },
      {
        seriesName: '',
        seriesLink: '/series/2',
        imageUrl: 'https://example.com/image2.jpg'
      },
      {
        seriesName: 'Valid Series 2',
        seriesLink: '',
        imageUrl: 'https://example.com/image3.jpg'
      }
    ];

    mockPage.evaluate.mockResolvedValue(mockSeries);

    const result = await massImportHoopla(false);

    expect(result.series).toHaveLength(1);
    expect(result.series[0]).toEqual(mockSeries[0]);
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Test error');
    mockPage.goto.mockRejectedValue(mockError);

    const result = await massImportHoopla(false);

    expect(logError).toHaveBeenCalledWith(mockError);
    expect(mockBrowser.close).toHaveBeenCalled();
    expect(result).toEqual({
      series: [],
      error: mockError
    });
  });

  it('should run headless in production', async () => {
    (isProduction as jest.Mock).mockReturnValue(true);
    mockPage.evaluate.mockResolvedValue([]);

    await massImportHoopla(false);

    expect(initScraperPage).toHaveBeenCalledWith(true);
  });
});
