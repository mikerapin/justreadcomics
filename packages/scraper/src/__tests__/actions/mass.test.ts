import { Request, Response } from 'express';
import { massImportMarvelAction, massImportImageAction, massImportShonenJumpAction } from '../../actions/mass';
import { massImportMarvel } from '../../scrape/marvel';
import { massImageImport } from '../../scrape/image';
import { massImportShonenJump } from '../../scrape/shonen-jump';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/shared-node/dist/s3/s3';
import { seriesModel } from '@justreadcomics/shared-node/dist/model/series';
import { Types } from 'mongoose';
import {
  MARVEL_UNLIMITED_SERVICE_ID,
  IMAGE_SERVICE_ID,
  SHONEN_JUMP_SERVICE_ID
} from '@justreadcomics/common/dist/const';

// Mock external dependencies
jest.mock('../../scrape/marvel');
jest.mock('../../scrape/image');
jest.mock('../../scrape/shonen-jump');
jest.mock('@justreadcomics/shared-node/dist/s3/s3');
jest.mock('@justreadcomics/shared-node/dist/model/series');

describe('Mass Import Actions', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockReq = {
      query: {}
    };
    mockRes = {
      json: mockJson,
      status: mockStatus
    };
  });

  describe('massImportMarvelAction', () => {
    const mockMarvelSeries = [
      {
        seriesName: 'Test Marvel Series',
        link: 'http://test.com/marvel',
        ongoing: true
      }
    ];

    it('should handle successful mass import', async () => {
      (massImportMarvel as jest.Mock).mockResolvedValue({ series: mockMarvelSeries });
      (seriesModel.insertMany as jest.Mock).mockResolvedValue(mockMarvelSeries);

      await massImportMarvelAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        size: 1,
        series: mockMarvelSeries
      });
    });

    it('should handle test mode', async () => {
      mockReq.query = { test: 'true' };
      (massImportMarvel as jest.Mock).mockResolvedValue({ series: mockMarvelSeries });

      await massImportMarvelAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        size: 1,
        finalResults: expect.arrayContaining([
          expect.objectContaining({
            seriesName: 'Test Marvel Series',
            ongoing: true,
            services: expect.arrayContaining([
              expect.objectContaining({
                _id: expect.any(Types.ObjectId),
                seriesServiceUrl: 'http://test.com/marvel'
              })
            ])
          })
        ])
      });
    });

    it('should handle scraping errors', async () => {
      const error = new Error('Scraping failed');
      (massImportMarvel as jest.Mock).mockResolvedValue({ error });

      await massImportMarvelAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error });
    });
  });

  describe('massImportImageAction', () => {
    const mockImageSeries = [
      {
        seriesName: 'Test Image Series',
        seriesLink: 'http://test.com/image'
      }
    ];

    it('should handle successful mass import', async () => {
      (massImageImport as jest.Mock).mockResolvedValue({ series: mockImageSeries });
      (seriesModel.insertMany as jest.Mock).mockResolvedValue(mockImageSeries);

      await massImportImageAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        size: 1,
        series: mockImageSeries
      });
    });

    it('should handle test mode', async () => {
      mockReq.query = { test: 'true' };
      (massImageImport as jest.Mock).mockResolvedValue({ series: mockImageSeries });

      await massImportImageAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        size: 1,
        finalResults: expect.arrayContaining([
          expect.objectContaining({
            seriesName: 'Test Image Series',
            services: expect.arrayContaining([
              expect.objectContaining({
                _id: expect.any(Types.ObjectId),
                seriesServiceUrl: 'http://test.com/image'
              })
            ])
          })
        ])
      });
    });

    it('should handle scraping errors', async () => {
      const error = new Error('Scraping failed');
      (massImageImport as jest.Mock).mockResolvedValue({ error });

      await massImportImageAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error });
    });
  });

  describe('massImportShonenJumpAction', () => {
    const mockShonenJumpSeries = [
      {
        seriesName: 'Test Shonen Jump Series',
        seriesLink: 'http://test.com/shonen-jump',
        imageUrl: 'http://test.com/image.jpg'
      }
    ];

    it('should handle successful mass import', async () => {
      (massImportShonenJump as jest.Mock).mockResolvedValue({ series: mockShonenJumpSeries });
      (uploadSeriesImageFromUrlToS3 as jest.Mock).mockResolvedValue('s3://test-image.jpg');
      (seriesModel.insertMany as jest.Mock).mockResolvedValue(mockShonenJumpSeries);

      await massImportShonenJumpAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        size: 1,
        series: mockShonenJumpSeries
      });
    });

    it('should handle test mode', async () => {
      mockReq.query = { test: 'true' };
      (massImportShonenJump as jest.Mock).mockResolvedValue({ series: mockShonenJumpSeries });
      (uploadSeriesImageFromUrlToS3 as jest.Mock).mockResolvedValue('s3://test-image.jpg');

      await massImportShonenJumpAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        size: 1,
        finalResults: expect.arrayContaining([
          expect.objectContaining({
            seriesName: 'Test Shonen Jump Series',
            image: 's3://test-image.jpg',
            services: expect.arrayContaining([
              expect.objectContaining({
                _id: expect.any(Types.ObjectId),
                seriesServiceUrl: 'http://test.com/shonen-jump'
              })
            ])
          })
        ])
      });
    });

    it('should handle scraping errors', async () => {
      const error = new Error('Scraping failed');
      (massImportShonenJump as jest.Mock).mockResolvedValue({ error });

      await massImportShonenJumpAction(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error });
    });
  });
});
