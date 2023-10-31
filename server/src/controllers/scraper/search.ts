import { Request, Response } from 'express';
import { getSeriesById } from '../series';

export const scrapeAndSearchCorpoAction = async (req: Request, res: Response) => {
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
};
