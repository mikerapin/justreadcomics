import { Request, Response } from 'express';
import { searchAndScrapeCorpoAction, searchAndScrapeHooplaAction } from '../../actions/search';
import { searchScrapeCorpo } from '../../scrape/corpo';
import { searchScrapeHoopla } from '../../scrape/hoopla';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/shared-node/dist/s3/s3';
import { getSeriesModelById } from '@justreadcomics/shared-node/dist/model/lookup';
import { CORPO_SERVICE_ID, CU_SERVICE_ID, HOOPLA_SERVICE_ID } from '@justreadcomics/common/dist/const';
import { cleanSearch } from '../../scrape/util';
import { distance } from 'closest-match';
import { queueModel } from '@justreadcomics/shared-node/dist/model/queue';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';
import { insertOrUpdateSeriesService } from '@justreadcomics/shared-node/dist/util/scraper';
import { QueueFilterType } from '@justreadcomics/common/dist/types/queue';

// Mock external dependencies
jest.mock('../../scrape/corpo', () => ({
  searchScrapeCorpo: jest.fn()
}));

jest.mock('../../scrape/hoopla', () => ({
  searchScrapeHoopla: jest.fn()
}));

jest.mock('@justreadcomics/shared-node/dist/s3/s3', () => ({
  uploadSeriesImageFromUrlToS3: jest.fn()
}));

jest.mock('@justreadcomics/shared-node/dist/model/lookup', () => ({
  getSeriesModelById: jest.fn()
}));

jest.mock('@justreadcomics/shared-node/dist/model/queue', () => ({
  queueModel: jest.fn().mockImplementation(() => ({
    validate: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true)
  }))
}));

jest.mock('@justreadcomics/shared-node/dist/util/scraper', () => ({
  insertOrUpdateSeriesService: jest.fn()
}));

jest.mock('@justreadcomics/shared-node/dist/util/logger', () => ({
  logError: jest.fn()
}));

jest.mock('closest-match', () => ({
  distance: jest.fn()
}));

jest.mock('../../scrape/util', () => ({
  cleanSearch: jest.fn()
}));

describe('Search Actions', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSeries: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();

    // Create a fresh mock series for each test
    mockSeries = {
      id: 'test-series-id',
      seriesName: 'Test Series',
      description: '',
      image: '',
      credits: [],
      services: {
        id: jest.fn().mockReturnValue(null),
        push: jest.fn(),
        deleteOne: jest.fn()
      },
      set: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
      toJSON: jest.fn().mockReturnValue({
        id: 'test-series-id',
        seriesName: 'Test Series',
        description: 'Test description',
        image: 's3://test-image.jpg',
        credits: [
          { name: 'Creator 1', role: '', order: 0 },
          { name: 'Creator 2', role: '', order: 1 }
        ]
      })
    };

    mockReq = {
      params: {
        id: 'test-series-id',
        fetchMetaData: 'false',
        cleanedTitle: 'false'
      }
    };

    mockRes = {
      json: mockJson,
      status: mockStatus
    };

    (getSeriesModelById as jest.Mock).mockResolvedValue(mockSeries);
    (cleanSearch as jest.Mock).mockImplementation((str) => str);
    (distance as jest.Mock).mockReturnValue(0);
  });

  describe('searchAndScrapeCorpoAction', () => {
    it('should handle missing id parameter', async () => {
      mockReq.params = { ...mockReq.params, id: '' };

      await searchAndScrapeCorpoAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: "that's a bad id"
      });
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle non-existent series', async () => {
      (getSeriesModelById as jest.Mock).mockResolvedValue(null);

      await searchAndScrapeCorpoAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: "series doesn't exist, bub"
      });
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle fetchMetaData mode', async () => {
      mockReq.params = { ...mockReq.params, fetchMetaData: 'true' };
      (getSeriesModelById as jest.Mock).mockResolvedValue(mockSeries);
      (searchScrapeCorpo as jest.Mock).mockResolvedValue({
        imageUrl: 'http://test.com/image.jpg',
        seriesPageUrl: 'http://test.com/series',
        withinCU: true,
        seriesDescription: 'Test description',
        seriesCredits: [
          { name: 'Creator 1', role: 'Writer' },
          { name: 'Creator 2', role: 'Artist' }
        ],
        seriesName: 'Test Series'
      });

      await searchAndScrapeCorpoAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: false,
        msg: 'this is where you only check availability'
      });
      expect(logError).not.toHaveBeenCalled();
      expect(mockSeries.save).not.toHaveBeenCalled();
      expect(insertOrUpdateSeriesService).not.toHaveBeenCalled();
    });

    it('should handle series not found in corpo', async () => {
      mockReq.params = { ...mockReq.params, fetchMetaData: '' };
      (searchScrapeCorpo as jest.Mock).mockResolvedValue({
        imageUrl: null,
        seriesPageUrl: null,
        withinCU: false,
        seriesDescription: null,
        seriesCredits: null,
        seriesName: null
      });
      (getSeriesModelById as jest.Mock).mockResolvedValue(mockSeries);

      await searchAndScrapeCorpoAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: 'Series not found in corpoland'
      });
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle series with distance exceeding allowed threshold', async () => {
      mockReq.params = { ...mockReq.params, fetchMetaData: '', cleanedTitle: '' };
      const mockSearchResult = {
        imageUrl: 'http://test.com/image.jpg',
        seriesPageUrl: 'http://test.com/series',
        withinCU: false,
        seriesDescription: 'Test description',
        seriesCredits: [
          { name: 'Creator 1', role: 'Writer' },
          { name: 'Creator 2', role: 'Artist' }
        ],
        seriesName: 'Different Series Name'
      };

      const mockSeriesWithName = {
        ...mockSeries,
        id: 'test-series-id',
        seriesName: 'Test Series',
        services: {
          id: jest.fn().mockReturnValue(null),
          push: jest.fn()
        },
        save: jest.fn().mockResolvedValue(undefined)
      };

      (getSeriesModelById as jest.Mock).mockResolvedValue(mockSeriesWithName);
      (searchScrapeCorpo as jest.Mock).mockResolvedValue(mockSearchResult);
      (distance as jest.Mock).mockReturnValue(5);

      await searchAndScrapeCorpoAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: false,
        msg: `Found the series ${mockSearchResult.seriesName} but it does not match ${mockSeriesWithName.seriesName} (distance: 5). Queuing the data for manual approval.`
      });
      expect(queueModel).toHaveBeenCalledWith({
        seriesId: mockSeriesWithName.id,
        serviceId: CORPO_SERVICE_ID,
        searchValue: mockSeriesWithName.seriesName,
        imageUrl: mockSearchResult.imageUrl,
        seriesPageUrl: mockSearchResult.seriesPageUrl,
        withinCU: mockSearchResult.withinCU,
        credits: mockSearchResult.seriesCredits,
        seriesDescription: mockSearchResult.seriesDescription,
        foundSeriesName: mockSearchResult.seriesName.trim(),
        distance: 5,
        reviewType: QueueFilterType.AUTO
      });
      expect(logError).not.toHaveBeenCalled();
      expect(mockSeriesWithName.save).not.toHaveBeenCalled();
      expect(insertOrUpdateSeriesService).not.toHaveBeenCalled();
    });

    it('should successfully update series with corpo data', async () => {
      mockReq.params = { ...mockReq.params, fetchMetaData: '' };
      const mockSearchResult = {
        imageUrl: 'http://test.com/image.jpg',
        seriesPageUrl: 'http://test.com/series',
        withinCU: true,
        seriesDescription: 'Test description',
        seriesCredits: [
          { name: 'Creator 1', role: 'Writer' },
          { name: 'Creator 2', role: 'Artist' }
        ],
        seriesName: mockSeries.seriesName
      };

      (getSeriesModelById as jest.Mock).mockResolvedValue(mockSeries);
      (searchScrapeCorpo as jest.Mock).mockResolvedValue(mockSearchResult);
      (distance as jest.Mock).mockReturnValue(0);
      (uploadSeriesImageFromUrlToS3 as jest.Mock).mockResolvedValue('s3://test-image.jpg');

      await searchAndScrapeCorpoAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: false,
        msg: `${mockSeries.seriesName} updated!`,
        series: mockSeries
      });
      expect(insertOrUpdateSeriesService).toHaveBeenCalledWith(
        mockSeries,
        CORPO_SERVICE_ID,
        mockSearchResult.seriesPageUrl
      );
      expect(mockSeries.services.id).toHaveBeenCalledWith(CU_SERVICE_ID);
      expect(mockSeries.services.push).toHaveBeenCalled();
      expect(mockSeries.save).toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle scraping errors', async () => {
      const error = new Error('Scraping failed');
      (searchScrapeCorpo as jest.Mock).mockRejectedValue(error);

      await searchAndScrapeCorpoAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: 'Something goofed when trying to scan'
      });
      expect(logError).toHaveBeenCalledWith(error);
    });
  });

  describe('searchAndScrapeHooplaAction', () => {
    it('should handle missing id parameter', async () => {
      mockReq.params = { ...mockReq.params, id: '' };

      await searchAndScrapeHooplaAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: "that's a bad id"
      });
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle non-existent series', async () => {
      (getSeriesModelById as jest.Mock).mockResolvedValue(null);

      await searchAndScrapeHooplaAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: "series doesn't exist, bub"
      });
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle series not found on hoopla', async () => {
      (searchScrapeHoopla as jest.Mock).mockResolvedValue({
        seriesPageUrl: null
      });

      await searchAndScrapeHooplaAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: 'Series not found on hoopla'
      });
      expect(logError).not.toHaveBeenCalled();
    });

    it('should successfully update series with hoopla data', async () => {
      mockReq.params = { ...mockReq.params, fetchMetaData: '' };
      const mockSearchResult = {
        imageUrl: 'http://test.com/image.jpg',
        seriesPageUrl: 'http://test.com/series',
        withinCU: true,
        seriesDescription: 'Test description',
        seriesCredits: [
          { name: 'Creator 1', role: 'Writer' },
          { name: 'Creator 2', role: 'Artist' }
        ],
        seriesName: mockSeries.seriesName
      };

      (getSeriesModelById as jest.Mock).mockResolvedValue(mockSeries);
      (searchScrapeHoopla as jest.Mock).mockResolvedValue(mockSearchResult);
      (distance as jest.Mock).mockReturnValue(0);
      (uploadSeriesImageFromUrlToS3 as jest.Mock).mockResolvedValue('s3://test-image.jpg');

      await searchAndScrapeHooplaAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: false,
        msg: `${mockSeries.seriesName} updated!`,
        series: mockSeries
      });
      expect(insertOrUpdateSeriesService).toHaveBeenCalledWith(
        mockSeries,
        HOOPLA_SERVICE_ID,
        mockSearchResult.seriesPageUrl
      );
      expect(mockSeries.save).toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle fetchMetaData mode', async () => {
      mockReq.params = { ...mockReq.params, fetchMetaData: 'true' };
      const mockSearchResult = {
        seriesPageUrl: 'http://test.com/series'
      };

      (searchScrapeHoopla as jest.Mock).mockResolvedValue(mockSearchResult);

      await searchAndScrapeHooplaAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: false,
        msg: `${mockSeries.seriesName} updated!`,
        series: mockSeries
      });
      expect(insertOrUpdateSeriesService).not.toHaveBeenCalled();
      expect(mockSeries.save).toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle scraping errors', async () => {
      const error = new Error('Scraping failed');
      (searchScrapeHoopla as jest.Mock).mockRejectedValue(error);

      await searchAndScrapeHooplaAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: 'Something goofed when trying to scan'
      });
      expect(logError).toHaveBeenCalledWith(error);
    });
  });
});
