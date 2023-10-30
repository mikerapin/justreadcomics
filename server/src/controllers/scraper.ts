import express = require('express');
import { Request, Response } from 'express';
import { massImportMarvel, scrapeMarvelSeries } from '../scrape/marvel';
import { getSeriesById } from './series';
import { seriesModel } from '../model/series';
import { keyChecker, verifyTokenMiddleware } from '../middleware/auth';
import { massDcImport } from '../scrape/dc';
import { uploadSeriesImageFromUrlToS3 } from '../s3/s3';
import sanitize from 'sanitize-filename';
import { chunk } from 'lodash';
import { promiseAllSequence } from '../util/scraper';
import { massImageImport } from '../scrape/image';

const MARVEL_UNLIMITED_SERVICE_ID = '65314ab18afab97567984de1';

const scraperRouter = express.Router();
scraperRouter.get('/marvel/:id', [verifyTokenMiddleware, keyChecker], async (req: Request, res: Response) => {
  const id = req.params.id;
  const { series } = await getSeriesById(id);

  // all of this below assumes the series has an series service URL, need to factor in the NOT
  //  indexed series eventually
  // This may be done using the `scrapeAndSearchMarvel` function in the scraper/marvel.ts... but it's imprecise

  const muService = series?.services?.find((service) => {
    return service.id === MARVEL_UNLIMITED_SERVICE_ID;
  });
  if (!series || !series.services || !muService || !muService.seriesServiceUrl) {
    res.status(400).json({
      msg: "series doesn't exist or it ain't attached to Marvel, bub"
    });
    return;
  }

  const { imageUrl, description, date } = await scrapeMarvelSeries(muService.seriesServiceUrl, false);

  // TODO: add the data to the db
  if (imageUrl) {
    series.image = await uploadSeriesImageFromUrlToS3(series.seriesName, imageUrl);
  }

  if (description.length) {
    series.description = description;
  }

  const muIndex = series.services.findIndex((service) => {
    return service.id === MARVEL_UNLIMITED_SERVICE_ID;
  });

  if (muIndex > -1) {
    series.services[muIndex].lastScan = new Date().toJSON();
  }

  series.save();

  res.status(200).json({ msg: `${series.seriesName} updated!`, series });
});

scraperRouter.get('/corpo/:id', [verifyTokenMiddleware, keyChecker], async (req: Request, res: Response) => {
  const id = req.params.id;
  const { series } = await getSeriesById(id);
  if (!series) {
    res.status(400).json({
      msg: "series doesn't exist, bub"
    });
    return;
  }

  // const result = await searchMarvel(series.seriesName, false);
  // if (result.error) {
  //   res.status(400).json(result.error);
  //   return;
  // }

  // TODO: add the data to the db

  res.status(200).json({});
});

// honestly, the following controllers should only need to be done once.
scraperRouter.get('/mass/marvel', [verifyTokenMiddleware, keyChecker], async (req: Request, res: Response) => {
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
});

scraperRouter.get('/mass/dc', [verifyTokenMiddleware, keyChecker], async (req: Request, res: Response) => {
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

scraperRouter.get('/mass/image', [verifyTokenMiddleware, keyChecker], async (req: Request, res: Response) => {
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
});

export { scraperRouter };
