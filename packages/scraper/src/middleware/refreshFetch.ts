import { NextFunction, Request, Response } from 'express';
import { getSeriesModelById } from '@justreadcomics/shared-node/dist/model/lookup';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

export const confirmIdAndFetchSeries = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
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
  } catch (e: any) {
    logError(e);
    res.status(400).json({ error: true, msg: 'Something goofed when trying to refresh' });
  }
};
