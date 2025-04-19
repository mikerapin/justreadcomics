import { massImportIdw } from '../idw';
import { IdwApiProduct, IdwApiResponse } from '@justreadcomics/common/dist/types/scraper';

// Mock fetch
global.fetch = jest.fn();

describe('IDW Scraper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('massImportIdw', () => {
    it('should successfully scrape series from IDW API', async () => {
      // Mock API responses
      const mockPage1Response: IdwApiResponse = {
        products: [
          {
            title: 'Test Series #1',
            type: 'Single Issue',
            description: '<p>Test description 1</p>',
            featured_image: '//example.com/image1.jpg',
            handle: 'test-series-1'
          },
          {
            title: 'Test Series #2',
            type: 'Single Issue',
            description: '<p>Test description 2</p>',
            featured_image: '//example.com/image2.jpg',
            handle: 'test-series-2'
          }
        ],
        products_count: 2,
        pagination_limit: 2
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockPage1Response)
      });

      const result = await massImportIdw();

      expect(result.series).toHaveLength(2);
      expect(result.series[0]).toEqual({
        seriesName: 'Test Series',
        description: 'Test description 1',
        seriesImage: 'http://example.com/image1.jpg',
        seriesLink: 'https://idwpublishing.com/products/test-series-1'
      });
      expect(result.series[1]).toEqual({
        seriesName: 'Test Series',
        description: 'Test description 2',
        seriesImage: 'http://example.com/image2.jpg',
        seriesLink: 'https://idwpublishing.com/products/test-series-2'
      });
    });

    it('should handle multiple pages of results', async () => {
      // Mock first page response
      const mockPage1Response: IdwApiResponse = {
        products: [
          {
            title: 'Series 1 #1',
            type: 'Single Issue',
            description: '<p>Description 1</p>',
            featured_image: '//example.com/image1.jpg',
            handle: 'series-1'
          }
        ],
        products_count: 3,
        pagination_limit: 2
      };

      // Mock second page response
      const mockPage2Response: IdwApiResponse = {
        products: [
          {
            title: 'Series 2 #1',
            type: 'Single Issue',
            description: '<p>Description 2</p>',
            featured_image: '//example.com/image2.jpg',
            handle: 'series-2'
          }
        ],
        products_count: 3,
        pagination_limit: 2
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockPage1Response)
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockPage2Response)
        });

      const result = await massImportIdw();

      expect(result.series).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await massImportIdw();

      expect(result.series).toEqual([]);
    });

    it('should handle malformed API responses', async () => {
      const mockMalformedResponse = {
        products: null,
        products_count: 'invalid',
        pagination_limit: 0
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockMalformedResponse)
      });

      const result = await massImportIdw();

      expect(result.series).toEqual([]);
    });

    it('should deduplicate series with the same name', async () => {
      const mockResponse: IdwApiResponse = {
        products: [
          {
            title: 'Same Series #1',
            type: 'Single Issue',
            description: '<p>Description 1</p>',
            featured_image: '//example.com/image1.jpg',
            handle: 'series-1'
          },
          {
            title: 'Same Series #2',
            type: 'Single Issue',
            description: '<p>Description 2</p>',
            featured_image: '//example.com/image2.jpg',
            handle: 'series-2'
          }
        ],
        products_count: 2,
        pagination_limit: 2
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await massImportIdw();

      expect(result.series).toHaveLength(1);
      expect(result.series[0].seriesName).toBe('Same Series');
    });

    it('should handle different product types', async () => {
      const mockResponse: IdwApiResponse = {
        products: [
          {
            title: 'Single Issue Series #1',
            type: 'Single Issue',
            description: '<p>Description 1</p>',
            featured_image: '//example.com/image1.jpg',
            handle: 'series-1'
          },
          {
            title: 'Trade Paperback',
            type: 'Book',
            description: '<p>Description 2</p>',
            featured_image: '//example.com/image2.jpg',
            handle: 'series-2'
          }
        ],
        products_count: 2,
        pagination_limit: 2
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await massImportIdw();

      expect(result.series).toHaveLength(2);
      expect(result.series[0].seriesName).toBe('Single Issue Series');
      expect(result.series[1].seriesName).toBe('Trade Paperback');
    });
  });
});
