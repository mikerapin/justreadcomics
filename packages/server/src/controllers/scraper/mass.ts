import sanitize from 'sanitize-filename';
import { MARVEL_UNLIMITED_SERVICE_ID } from '../../static/const';
import { Request, Response } from 'express';
import { chunk } from 'lodash';
import { massDcImport } from '../../scrape/dc';
import { massImageImport } from '../../scrape/image';
import { massImportMarvel } from '../../scrape/marvel';
import { promiseAllSequence } from '../../util/scraper';
import { seriesModel } from '../../model/series';
import { uploadSeriesImageFromUrlToS3 } from '../../s3/s3';

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
        seriesName,
        ongoing,
        services: [
          {
            id: MARVEL_UNLIMITED_SERVICE_ID, // Marvel Unlimited service
            seriesServiceUrl: link,
            lastScan: date
          }
        ]
      };
    });

    if (!req.query.test) {
      const newSeries = await seriesModel.insertMany(finalResults, { throwOnValidationError: false, ordered: false });

      res.status(200).json({ size: finalResults.length, series: newSeries });
      return;
    }
    res.status(200).json({ size: finalResults.length, finalResults });
  } catch (e: any) {
    console.log(e);
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
          if (!includeImages) {
            imageLocation = await uploadSeriesImageFromUrlToS3(series.seriesName, seriesImage);
          }

          return {
            image: imageLocation,
            seriesName: sanitize(seriesName),
            ongoing,
            services: [
              {
                id: '65314bb94223c7aefc0027ce', // DC UniverseInfinite service
                seriesServiceUrl: seriesLink,
                lastScan: date
              }
            ]
          };
        })
      )
    ).then((chunkedResults) => chunkedResults.flat());

    if (!req.query.test) {
      const newSeries = await seriesModel.insertMany(finalResults, { throwOnValidationError: false, ordered: false });

      res.status(200).json({ size: finalResults.length, series: newSeries });
      return;
    }
    res.status(200).json({ size: finalResults.length, finalResults });
  } catch (e: any) {
    console.log(e);
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
            id: '653afb1e23027c9826267cb8', // Image (storage for later scraping)
            seriesServiceUrl: seriesLink,
            lastScan: date
          }
        ]
      };
    });

    if (!req.query.test) {
      const newSeries = await seriesModel.insertMany(finalResults, { throwOnValidationError: false, ordered: false });

      res.status(200).json({ size: finalResults.length, series: newSeries });
      return;
    }
    res.status(200).json({ size: finalResults.length, finalResults });
  } catch (e: any) {
    console.log(e);
    res.status(400).json({ e });
  }
};
