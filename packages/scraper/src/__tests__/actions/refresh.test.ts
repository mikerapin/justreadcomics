import { Request, Response } from 'express';
import {
  refreshCorpoMetadataAction,
  refreshImageMetadataAction,
  refreshMarvelMetadataAction
} from '../../actions/refresh';
import { refreshCorpoMetadata } from '../../scrape/corpo';
import { refreshImageMetadata } from '../../scrape/image';
import { refreshMarvelMetadata } from '../../scrape/marvel';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/shared-node/dist/s3/s3';
import { CORPO_SERVICE_ID, IMAGE_SERVICE_ID, MARVEL_UNLIMITED_SERVICE_ID } from '@justreadcomics/common/dist/const';
import { Types } from 'mongoose';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

// Mock external dependencies
jest.mock('../../scrape/corpo', () => ({
  refreshCorpoMetadata: jest.fn()
}));

jest.mock('../../scrape/image', () => ({
  refreshImageMetadata: jest.fn()
}));

jest.mock('../../scrape/marvel', () => ({
  refreshMarvelMetadata: jest.fn()
}));

jest.mock('@justreadcomics/shared-node/dist/s3/s3', () => ({
  uploadSeriesImageFromUrlToS3: jest.fn()
}));

// Mock the logger to prevent error logs
jest.mock('@justreadcomics/shared-node/dist/util/logger', () => ({
  logError: jest.fn()
}));

describe('Refresh Actions', () => {
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
      set: jest.fn(),
      save: jest.fn(),
      toJSON: jest.fn().mockReturnValue({
        seriesName: 'Test Series',
        description: 'Test description',
        image: 's3://test-image.jpg',
        credits: [
          { name: 'Creator 1', role: '', order: 0 },
          { name: 'Creator 2', role: '', order: 1 }
        ]
      })
    };

    mockReq = {};
    mockRes = {
      json: mockJson,
      status: mockStatus,
      locals: {
        series: mockSeries
      }
    };
  });

  describe('refreshCorpoMetadataAction', () => {
    it('should successfully refresh corpo metadata', async () => {
      const mockMetadata = {
        imageUrl: 'http://test.com/image.jpg',
        description: 'Test description',
        credits: [
          { name: 'Creator 1', role: 'Writer' },
          { name: 'Creator 2', role: 'Artist' }
        ]
      };

      mockSeries.services.id.mockReturnValue({
        _id: CORPO_SERVICE_ID,
        seriesServiceUrl: 'http://test.com/series'
      });
      (refreshCorpoMetadata as jest.Mock).mockResolvedValue(mockMetadata);
      (uploadSeriesImageFromUrlToS3 as jest.Mock).mockResolvedValue('s3://test-image.jpg');

      await refreshCorpoMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: false,
        msg: 'Test Series updated with refreshed metadata',
        series: expect.any(Object)
      });
      expect(mockSeries.set).toHaveBeenCalledWith(mockMetadata);
      expect(mockSeries.save).toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle series without corpo service', async () => {
      mockSeries.services.id.mockReturnValue(null);

      await refreshCorpoMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: 'Test Series not found on corpo, are you sure you meant to run this?'
      });
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle scraping errors', async () => {
      const error = new Error('Scraping failed');
      mockSeries.services.id.mockReturnValue({
        _id: CORPO_SERVICE_ID,
        seriesServiceUrl: 'http://test.com/series'
      });
      (refreshCorpoMetadata as jest.Mock).mockRejectedValue(error);

      await refreshCorpoMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: 'Something goofed when trying to refresh'
      });
      expect(logError).toHaveBeenCalledWith(error);
    });
  });

  describe('refreshMarvelMetadataAction', () => {
    it('should successfully refresh marvel metadata', async () => {
      const mockMetadata = {
        imageUrl: 'http://test.com/image.jpg',
        description: 'Test description'
      };

      mockSeries.services.id.mockReturnValue({
        _id: MARVEL_UNLIMITED_SERVICE_ID,
        seriesServiceUrl: 'http://test.com/series'
      });
      (refreshMarvelMetadata as jest.Mock).mockResolvedValue(mockMetadata);
      (uploadSeriesImageFromUrlToS3 as jest.Mock).mockResolvedValue('s3://test-image.jpg');

      await refreshMarvelMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: false,
        msg: 'Test Series updated with refreshed metadata',
        series: expect.any(Object)
      });
      expect(mockSeries.set).toHaveBeenCalledWith({ description: mockMetadata.description });
      expect(mockSeries.save).toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle series without marvel service', async () => {
      mockSeries.services.id.mockReturnValue(null);

      await refreshMarvelMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: 'Test Series not found on marvel, are you sure you meant to run this?'
      });
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle scraping errors', async () => {
      const error = new Error('Scraping failed');
      mockSeries.services.id.mockReturnValue({
        _id: MARVEL_UNLIMITED_SERVICE_ID,
        seriesServiceUrl: 'http://test.com/series'
      });
      (refreshMarvelMetadata as jest.Mock).mockRejectedValue(error);

      await refreshMarvelMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: 'Something goofed when trying to refresh'
      });
      expect(logError).toHaveBeenCalledWith(error);
    });
  });

  describe('refreshImageMetadataAction', () => {
    it('should successfully refresh image metadata', async () => {
      const mockMetadata = {
        description: 'Test description',
        creators: [
          { name: 'Creator 1', role: '' },
          { name: 'Creator 2', role: '' }
        ]
      };

      mockSeries.services.id.mockReturnValue({
        _id: IMAGE_SERVICE_ID,
        seriesServiceUrl: 'http://test.com/series'
      });
      (refreshImageMetadata as jest.Mock).mockResolvedValue(mockMetadata);

      await refreshImageMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: false,
        msg: 'Test Series updated with refreshed metadata',
        series: expect.any(Object)
      });
      expect(mockSeries.set).toHaveBeenCalledWith({
        description: mockMetadata.description,
        creators: mockMetadata.creators
      });
      expect(mockSeries.save).toHaveBeenCalled();
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle series without image service', async () => {
      mockSeries.services.id.mockReturnValue(null);

      await refreshImageMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: 'Test Series not found on marvel, are you sure you meant to run this?'
      });
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle scraping errors', async () => {
      const error = new Error('Scraping failed');
      mockSeries.services.id.mockReturnValue({
        _id: IMAGE_SERVICE_ID,
        seriesServiceUrl: 'http://test.com/series'
      });
      (refreshImageMetadata as jest.Mock).mockRejectedValue(error);

      await refreshImageMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: true,
        msg: 'Something goofed when trying to refresh'
      });
      expect(logError).toHaveBeenCalledWith(error);
    });
  });
});
