import { Request, Response } from 'express';
import { scrapeIndexedShonenJumpSeriesAction } from '../../actions/indexed';
import { getSeriesModelById } from '@justreadcomics/shared-node/dist/model/lookup';
import { scrapeShonenJumpSeries } from '../../scrape/shonen-jump';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/shared-node/dist/s3/s3';
import { SHONEN_JUMP_SERVICE_ID } from '@justreadcomics/common/dist/const';

// Mock external dependencies
jest.mock('@justreadcomics/shared-node/dist/model/lookup');
jest.mock('../../scrape/shonen-jump');
jest.mock('@justreadcomics/shared-node/dist/s3/s3');

describe('Indexed Actions', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSeries: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockReq = {
      params: {
        id: 'test-series-id'
      }
    };
    mockRes = {
      json: mockJson,
      status: mockStatus
    };

    // Create a fresh mock series for each test
    mockSeries = {
      seriesName: 'Test Series',
      description: undefined,
      image: undefined,
      credits: undefined,
      services: {
        id: jest.fn().mockReturnValue({
          seriesServiceUrl: 'http://test.com/series',
          lastScan: '2024-01-01T00:00:00.000Z'
        })
      },
      save: jest.fn()
    };

    // Default mock implementations
    (getSeriesModelById as jest.Mock).mockResolvedValue(mockSeries);
    (scrapeShonenJumpSeries as jest.Mock).mockResolvedValue({
      imageUrl: 'http://test.com/image.jpg',
      description: 'Test description',
      creators: ['Creator 1', 'Creator 2']
    });
    (uploadSeriesImageFromUrlToS3 as jest.Mock).mockResolvedValue('s3://test-image.jpg');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scrapeIndexedShonenJumpSeriesAction', () => {
    it('should successfully scrape and update a Shonen Jump series', async () => {
      await scrapeIndexedShonenJumpSeriesAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Test Series updated!',
        series: expect.objectContaining({
          description: 'Test description',
          image: 's3://test-image.jpg',
          credits: [
            { name: 'Creator 1', role: '', order: 0 },
            { name: 'Creator 2', role: '', order: 1 }
          ]
        })
      });
      expect(mockSeries.save).toHaveBeenCalled();
    });

    it('should handle non-existent series', async () => {
      (getSeriesModelById as jest.Mock).mockResolvedValue(null);

      await scrapeIndexedShonenJumpSeriesAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        msg: "series doesn't exist, bub"
      });
    });

    it('should handle series without Shonen Jump service', async () => {
      const seriesWithoutService = {
        ...mockSeries,
        services: {
          id: jest.fn().mockReturnValue(null)
        }
      };
      (getSeriesModelById as jest.Mock).mockResolvedValue(seriesWithoutService);

      await scrapeIndexedShonenJumpSeriesAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        msg: "service ain't attached to that series"
      });
    });

    it('should update only provided fields', async () => {
      // Override the default mock for this test
      (scrapeShonenJumpSeries as jest.Mock).mockResolvedValue({
        imageUrl: undefined,
        description: undefined,
        creators: undefined
      });

      await scrapeIndexedShonenJumpSeriesAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        msg: 'Test Series updated!',
        series: expect.objectContaining({
          description: undefined,
          image: undefined,
          credits: undefined
        })
      });
      expect(mockSeries.save).toHaveBeenCalled();
    });
  });
});
