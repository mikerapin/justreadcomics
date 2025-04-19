import { massImportIdw } from '../../scrape/idw';
import { IdwApiProduct, IdwApiResponse } from '@justreadcomics/common/dist/types/scraper';

// Mock fetch
global.fetch = jest.fn();

describe('IDW Scraper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('massImportIdw', () => {
    it('should successfully scrape series from IDW API', async () => {
      const mockResponse: IdwApiResponse = {
        products: [
          {
            title: 'Test Series #1',
            description: 'Description 1',
            featured_image: '//example.com/image1.jpg',
            handle: 'test-series-1',
            type: 'Book'
          }
        ],
        products_count: 1,
        pagination_limit: 50
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await massImportIdw();

      expect(result.series).toHaveLength(1);
      expect(result.series[0]).toEqual({
        seriesName: 'Test Series #1',
        description: 'Description 1',
        seriesImage: 'http://example.com/image1.jpg',
        seriesLink: 'https://idwpublishing.com/products/test-series-1'
      });
    });

    it('should handle multiple pages of results', async () => {
      const mockResponse1: IdwApiResponse = {
        products: [
          {
            title: 'Series 1 #1',
            description: 'Description 1',
            featured_image: '//example.com/image1.jpg',
            handle: 'series-1',
            type: 'Book'
          }
        ],
        products_count: 2,
        pagination_limit: 1
      };

      const mockResponse2: IdwApiResponse = {
        products: [
          {
            title: 'Series 2 #1',
            description: 'Description 2',
            featured_image: '//example.com/image2.jpg',
            handle: 'series-2',
            type: 'Book'
          }
        ],
        products_count: 2,
        pagination_limit: 1
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse1)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse2)
        });

      const result = await massImportIdw();

      expect(result.series).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await massImportIdw();

      expect(result.series).toHaveLength(0);
    });

    it('should handle malformed API responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      const result = await massImportIdw();

      expect(result.series).toHaveLength(0);
    });

    it('should deduplicate series with the same name', async () => {
      const mockResponse: IdwApiResponse = {
        products: [
          {
            title: 'Test Series',
            description: 'Description 1',
            featured_image: '//example.com/image1.jpg',
            handle: 'test-series-1',
            type: 'Book'
          },
          {
            title: 'Test Series',
            description: 'Description 2',
            featured_image: '//example.com/image2.jpg',
            handle: 'test-series-2',
            type: 'Book'
          }
        ],
        products_count: 2,
        pagination_limit: 50
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await massImportIdw();

      expect(result.series).toHaveLength(1);
      expect(result.series[0].seriesName).toBe('Test Series');
    });

    it('should handle different product types', async () => {
      const mockResponse: IdwApiResponse = {
        products: [
          {
            title: 'Test Series - Issue #1',
            description: 'Description 1',
            featured_image: '//example.com/image1.jpg',
            handle: 'test-series-1',
            type: 'Single Issue'
          },
          {
            title: 'Different Series',
            description: 'Description 2',
            featured_image: '//example.com/image2.jpg',
            handle: 'test-series-2',
            type: 'Book'
          }
        ],
        products_count: 2,
        pagination_limit: 50
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await massImportIdw();

      expect(result.series).toHaveLength(2);
      expect(result.series[0].seriesName).toBe('Test Series');
      expect(result.series[1].seriesName).toBe('Different Series');
    });
  });
});
