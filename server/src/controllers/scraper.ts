import express = require('express');
import { Request, Response } from 'express';
import { massImportMarvel, searchMarvel } from '../scrape/marvel';
import { getSeriesById } from './series';
import { seriesModel } from '../model/series';
import { keyChecker } from '../middelware/scraper';
import { massDcImport } from '../scrape/dc';
import { uploadSeriesImageFromUrlToS3 } from '../s3/s3';
import sanitize from 'sanitize-filename';
import { IMassDcImport } from '../types/scraper';
import { chunk } from 'lodash';
import { promiseAllSequence } from '../util/scraper';

const scraperRouter = express.Router();
scraperRouter.get('/marvel/:id', [keyChecker], async (req: Request, res: Response) => {
  const id = req.params.id;
  const { series } = await getSeriesById(id);
  if (!series) {
    res.status(400).json({
      msg: "series doesn't exist, bub"
    });
    return;
  }

  const result = await searchMarvel(series.seriesName, false);
  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  // TODO: add the data to the db

  res.status(200).json(result);
});

export { scraperRouter };

// honestly, the following controllers should only need to be done once.
scraperRouter.get('/mass/marvel', [keyChecker], async (req: Request, res: Response) => {
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
            id: '65314ab18afab97567984de1', // Marvel Unlimited service
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
});
scraperRouter.get('/mass/dc', [keyChecker], async (req: Request, res: Response) => {
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
});
