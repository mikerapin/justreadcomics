import express = require('express');
import { Request, Response } from 'express';
import { massImportMarvel, searchMarvel } from '../scrape/marvel';
import { getSeriesById } from './series';

const scraperRouter = express.Router();

// honestly, this should only be done once.
// and it lives above `/marvel/:id` so it's not caught by that route
scraperRouter.get('/marvel-import/massImport', async (req: Request, res: Response) => {
  const key = 'fea91d86-3356-4dea-83d6-05cf70a832df';
  if (req.query.key !== key) {
    res.status(400).json({ msg: 'no key, no import' });
    return;
  }
  const result = await massImportMarvel(false);
  if (result.error) {
    res.status(400).json(result.error);
    return;
  }

  // TODO: add the data to the db

  res.status(200).json(result);
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
