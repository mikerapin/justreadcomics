import express = require('express');
import { Request, Response } from 'express';
import { massImportMarvel, searchMarvel } from '../scrape/marvel';
import { getSeriesById } from './series';
import { seriesModel } from '../model/series';

const scraperRouter = express.Router();

// honestly, this should only be done once.
scraperRouter.get('/marvel-import/massImport', async (req: Request, res: Response) => {
  const key = process.env.MASS_IMPORT_KEY;
  if (req.query.key !== key) {
    res.status(400).json({ msg: 'no key, no import' });
    return;
  }
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
            id: '65314ab18afab97567984de1',
            seriesServiceUrl: link,
            lastScan: date
          }
        ]
      };
    });

    const newSeries = await seriesModel.insertMany(finalResults, { throwOnValidationError: false, ordered: false });

    res.status(200).json({ size: finalResults.length, series: newSeries });
  } catch (e: any) {
    console.log(e);
    res.status(400).json({ e });
  }
});

scraperRouter.get('/marvel/:id', async (req: Request, res: Response) => {
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
