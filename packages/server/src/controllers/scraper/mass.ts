import {
  DC_INFINITE_UNIVERSE_SERVICE_ID,
  IMAGE_SERVICE_ID,
  MARVEL_UNLIMITED_SERVICE_ID,
  SHONEN_JUMP_SERVICE_ID
} from '../../static/const';
import { Request, Response } from 'express';
import { chunk } from 'lodash';
import { massDcImport } from '../../scrape/dc';
import { massImageImport } from '../../scrape/image';
import { massImportMarvel } from '../../scrape/marvel';
import { massImportIdw } from '../../scrape/idw';
import { Types } from 'mongoose';
import { massImportShonenJump } from '../../scrape/shonen-jump';
import { cleanSeriesName } from '@justreadcomics/common/dist/util/string';
import { promiseAllSequence } from '@justreadcomics/common/dist/util/scraper';
import { seriesModel } from '@justreadcomics/common/dist/model/series';
import { logError } from '@justreadcomics/common/dist/util/logger';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/common/dist/s3/s3';

export const massImportMarvelAction = async (req: Request, res: Response) => {
  const result = await massImportMarvel(false);
  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  try {
    const finalResults = result.series.map((series) => {
      const date = new Date().toJSON();
      const { seriesName, link, ongoing } = series;
      return {
        seriesName: cleanSeriesName(seriesName),
        ongoing,
        services: [
          {
            _id: new Types.ObjectId(MARVEL_UNLIMITED_SERVICE_ID), // Marvel Unlimited service
            seriesServiceUrl: link,
            lastScan: date
          }
        ]
      };
    });

    if (!req.query.test) {
      const newSeries = await seriesModel.insertMany(finalResults, {
        throwOnValidationError: false,
        ordered: false
      });

      res.status(200).json({ size: finalResults.length, series: newSeries });
      return;
    }
    res.status(200).json({ size: finalResults.length, finalResults });
  } catch (e: any) {
    logError(e);
    res.status(400).json({ e });
  }
};

export const massImportDcAction = async (req: Request, res: Response) => {
  const result = await massDcImport(false);
  const includeImages = req.query.includeImages;

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  try {
    const finalResults = await promiseAllSequence(chunk(result.series, 20), (chunk) =>
      Promise.all(
        chunk.map(async (series) => {
          const date = new Date().toJSON();
          const { seriesName, seriesLink, ongoing, seriesImage } = series;
          let imageLocation;
          const finalSeriesName = cleanSeriesName(seriesName);
          if (!includeImages) {
            imageLocation = await uploadSeriesImageFromUrlToS3(finalSeriesName, seriesImage);
          }

          return {
            image: imageLocation,
            seriesName: finalSeriesName,
            ongoing,
            services: [
              {
                _id: new Types.ObjectId(DC_INFINITE_UNIVERSE_SERVICE_ID),
                seriesServiceUrl: seriesLink,
                lastScan: date
              }
            ]
          };
        })
      )
    ).then((chunkedResults) => chunkedResults.flat());

    if (!req.query.test) {
      const newSeries = await seriesModel.insertMany(finalResults, {
        throwOnValidationError: false,
        ordered: false
      });

      res.status(200).json({ size: finalResults.length, series: newSeries });
      return;
    }
    res.status(200).json({ size: finalResults.length, finalResults });
  } catch (e: any) {
    logError(e);
    res.status(400).json({ e });
  }
};

export const massImportImageAction = async (req: Request, res: Response) => {
  const result = await massImageImport(false);

  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  try {
    const finalResults = result.series.map((series) => {
      const date = new Date().toJSON();
      const { seriesName, seriesLink } = series;
      return {
        seriesName,
        services: [
          {
            _id: new Types.ObjectId(IMAGE_SERVICE_ID), // Image (storage for later scraping)
            seriesServiceUrl: seriesLink,
            lastScan: date
          }
        ]
      };
    });

    if (!req.query.test) {
      const newSeries = await seriesModel.insertMany(finalResults, {
        throwOnValidationError: false,
        ordered: false
      });

      res.status(200).json({ size: finalResults.length, series: newSeries });
      return;
    }
    res.status(200).json({ size: finalResults.length, finalResults });
  } catch (e: any) {
    logError(e);
    res.status(400).json({ e });
  }
};

export const massImportShonenJumpAction = async (req: Request, res: Response) => {
  const result = await massImportShonenJump(false);

  try {
    const finalResults = await promiseAllSequence(chunk(result.series, 20), (chunk) =>
      Promise.all(
        chunk.map(async (series) => {
          const date = new Date().toJSON();
          const { seriesName, seriesLink, imageUrl } = series;
          const finalSeriesName = cleanSeriesName(seriesName);
          const imageLocation = await uploadSeriesImageFromUrlToS3(finalSeriesName, imageUrl);

          return {
            image: imageLocation,
            seriesName: finalSeriesName,
            services: [
              {
                _id: new Types.ObjectId(SHONEN_JUMP_SERVICE_ID),
                seriesServiceUrl: seriesLink,
                lastScan: date
              }
            ]
          };
        })
      )
    ).then((chunkedResults) => chunkedResults.flat());

    if (!req.query.test) {
      const newSeries = await seriesModel.insertMany(finalResults, {
        throwOnValidationError: false,
        ordered: false
      });

      res.status(200).json({ size: finalResults.length, series: newSeries });
      return;
    }
    res.status(200).json({ size: finalResults.length, finalResults });
  } catch (e: any) {
    logError(e);
    res.status(400).json({ e });
  }
};

// DELETE
// await seriesModel.deleteMany({ createdAt: { $gt: '2023-11-16T03:07:03.213+00:00' } });
// res.status(200).json('done');

/**
 * WARNING - THIS DOES NOT ACTUALLY DO WHAT WE WANT. IT IMPORTS ALL THE GODDAMN SINGLE ISSUE AND VOLUMES UGGHFGHGHGHGHGHGHGHH
 * @param req
 * @param res
 */
export const massImportIdwAction = async (req: Request, res: Response) => {
  const result = await massImportIdw();
  try {
    const finalResults = await promiseAllSequence(chunk(result.series, 20), (chunk) =>
      Promise.all(
        chunk.map(async (series) => {
          const date = new Date().toJSON();
          const { seriesName, seriesLink, seriesImage, description } = series;
          const finalSeriesName = cleanSeriesName(seriesName);
          const imageLocation = await uploadSeriesImageFromUrlToS3(finalSeriesName, seriesImage);

          return {
            image: imageLocation,
            seriesName: finalSeriesName,
            description,
            services: [
              {
                _id: new Types.ObjectId('654fe4e31bb87e8d78f10d9c'), // IDW Site for storage
                seriesServiceUrl: seriesLink,
                lastScan: date
              }
            ]
          };
        })
      )
    ).then((chunkedResults) => chunkedResults.flat());

    if (!req.query.test) {
      const newSeries = await seriesModel.insertMany(finalResults, {
        throwOnValidationError: false,
        ordered: false
      });

      res.status(200).json({ size: finalResults.length, series: newSeries });
      return;
    }
    res.status(200).json({ size: finalResults.length, finalResults });
  } catch (e: any) {
    logError(e);
    res.status(400).json({ e });
  }
};
