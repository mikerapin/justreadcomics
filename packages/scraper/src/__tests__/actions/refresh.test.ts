import { Request, Response } from 'express';
import {
  refreshCorpoMetadataAction,
  refreshMarvelMetadataAction,
  refreshImageMetadataAction
} from '../../actions/refresh';
import { refreshCorpoMetadata } from '../../scrape/corpo';
import { refreshMarvelMetadata } from '../../scrape/marvel';
import { refreshImageMetadata } from '../../scrape/image';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/shared-node/dist/s3/s3';
import { CORPO_SERVICE_ID, IMAGE_SERVICE_ID, MARVEL_UNLIMITED_SERVICE_ID } from '@justreadcomics/common/dist/const';
import { ISeries } from '@justreadcomics/common/dist/types/series';

// Mock the scraper functions
jest.mock('../../scrape/corpo', () => ({
  refreshCorpoMetadata: jest.fn()
}));

jest.mock('../../scrape/marvel', () => ({
  refreshMarvelMetadata: jest.fn()
}));

jest.mock('../../scrape/image', () => ({
  refreshImageMetadata: jest.fn()
}));

// Mock S3 upload
jest.mock('@justreadcomics/shared-node/dist/s3/s3', () => ({
  uploadSeriesImageFromUrlToS3: jest.fn()
}));

// Mock logger
jest.mock('@justreadcomics/shared-node/dist/util/logger', () => ({
  logError: jest.fn()
}));

describe('Refresh Actions', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockSeries: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock series
    mockSeries = {
      seriesName: 'Test Series',
      image: null,
      services: {
        id: jest.fn()
      },
      set: jest.fn(),
      save: jest.fn(),
      toJSON: jest.fn().mockReturnValue({ id: '123', seriesName: 'Test Series' })
    };

    // Setup mock request and response
    mockReq = {};
    mockRes = {
      locals: { series: mockSeries },
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('refreshCorpoMetadataAction', () => {
    it('should successfully refresh Corpo metadata', async () => {
      const mockMetadata = {
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };

      mockSeries.services.id.mockReturnValue({
        seriesServiceUrl: 'https://corpo.com/series/1'
      });

      (refreshCorpoMetadata as jest.Mock).mockResolvedValue(mockMetadata);
      (uploadSeriesImageFromUrlToS3 as jest.Mock).mockResolvedValue('s3://image.jpg');

      await refreshCorpoMetadataAction(mockReq as Request, mockRes as Response);

      expect(refreshCorpoMetadata).toHaveBeenCalledWith('https://corpo.com/series/1');
      expect(mockSeries.set).toHaveBeenCalledWith({
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      });
      expect(mockSeries.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        error: false,
        msg: 'Test Series updated with refreshed metadata',
        series: { id: '123', seriesName: 'Test Series' }
      });
    });

    it('should handle missing Corpo service', async () => {
      mockSeries.services.id.mockReturnValue(null);

      await refreshCorpoMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        msg: 'Test Series not found on corpo, are you sure you meant to run this?'
      });
    });

    it('should handle errors gracefully', async () => {
      mockSeries.services.id.mockReturnValue({
        seriesServiceUrl: 'https://corpo.com/series/1'
      });

      (refreshCorpoMetadata as jest.Mock).mockRejectedValue(new Error('Refresh failed'));

      await refreshCorpoMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        msg: 'Something goofed when trying to refresh'
      });
    });
  });

  describe('refreshMarvelMetadataAction', () => {
    it('should successfully refresh Marvel metadata', async () => {
      const mockMetadata = {
        imageUrl: 'https://example.com/image.jpg',
        description: 'Test description'
      };

      mockSeries.services.id.mockReturnValue({
        seriesServiceUrl: 'https://marvel.com/series/1'
      });

      (refreshMarvelMetadata as jest.Mock).mockResolvedValue(mockMetadata);
      (uploadSeriesImageFromUrlToS3 as jest.Mock).mockResolvedValue('s3://image.jpg');

      await refreshMarvelMetadataAction(mockReq as Request, mockRes as Response);

      expect(refreshMarvelMetadata).toHaveBeenCalledWith('https://marvel.com/series/1');
      expect(mockSeries.set).toHaveBeenCalledWith({ description: 'Test description' });
      expect(mockSeries.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        error: false,
        msg: 'Test Series updated with refreshed metadata',
        series: { id: '123', seriesName: 'Test Series' }
      });
    });

    it('should handle missing Marvel service', async () => {
      mockSeries.services.id.mockReturnValue(null);

      await refreshMarvelMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        msg: 'Test Series not found on marvel, are you sure you meant to run this?'
      });
    });

    it('should handle errors gracefully', async () => {
      mockSeries.services.id.mockReturnValue({
        seriesServiceUrl: 'https://marvel.com/series/1'
      });

      (refreshMarvelMetadata as jest.Mock).mockRejectedValue(new Error('Refresh failed'));

      await refreshMarvelMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        msg: 'Something goofed when trying to refresh'
      });
    });
  });

  describe('refreshImageMetadataAction', () => {
    it('should successfully refresh Image metadata', async () => {
      const mockMetadata = {
        creators: ['Creator 1', 'Creator 2'],
        description: 'Test description'
      };

      mockSeries.services.id.mockReturnValue({
        seriesServiceUrl: 'https://image.com/series/1'
      });

      (refreshImageMetadata as jest.Mock).mockResolvedValue(mockMetadata);

      await refreshImageMetadataAction(mockReq as Request, mockRes as Response);

      expect(refreshImageMetadata).toHaveBeenCalledWith('https://image.com/series/1');
      expect(mockSeries.set).toHaveBeenCalledWith({
        description: 'Test description',
        creators: ['Creator 1', 'Creator 2']
      });
      expect(mockSeries.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        error: false,
        msg: 'Test Series updated with refreshed metadata',
        series: { id: '123', seriesName: 'Test Series' }
      });
    });

    it('should handle missing Image service', async () => {
      mockSeries.services.id.mockReturnValue(null);

      await refreshImageMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        msg: 'Test Series not found on marvel, are you sure you meant to run this?'
      });
    });

    it('should handle errors gracefully', async () => {
      mockSeries.services.id.mockReturnValue({
        seriesServiceUrl: 'https://image.com/series/1'
      });

      (refreshImageMetadata as jest.Mock).mockRejectedValue(new Error('Refresh failed'));

      await refreshImageMetadataAction(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        msg: 'Something goofed when trying to refresh'
      });
    });
  });
});
