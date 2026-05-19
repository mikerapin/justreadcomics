import { NextFunction, Request, Response } from 'express';
import { getSeriesModelById } from '../model/lookup';
import { logError } from '../util/logger';

const confirmIdAndFetchSeries = async (req: Request, res: Response, next: NextFunction, id?: string) => {
  if (!id) {
    res.status(400).json({
      error: true,
      msg: "that's a bad id"
    });
    return;
  }
  try {
    const series = await getSeriesModelById(id);
    if (!series) {
      res.status(400).json({
        error: true,
        msg: "series doesn't exist, bub"
      });
      return;
    }

    res.locals.series = series;
    next();
  } catch (e: unknown) {
    logError(e);
    res.status(400).json({ error: true, msg: 'Something goofed when trying to refresh' });
  }
};

export const confirmIdFromBodyAndFetchSeries = async (req: Request, res: Response, next: NextFunction) => {
  await confirmIdAndFetchSeries(req, res, next, req.body.seriesId);
};

export const confirmIdFromParamAndFetchSeries = async (req: Request, res: Response, next: NextFunction) => {
  await confirmIdAndFetchSeries(req, res, next, req.params.id);
};
