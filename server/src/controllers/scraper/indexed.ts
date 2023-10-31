import { Request, Response } from 'express';
import { getSeriesById } from '../series';
import { scrapeMarvelSeries } from '../../scrape/marvel';
import { uploadSeriesImageFromUrlToS3 } from '../../s3/s3';
import { MARVEL_UNLIMITED_SERVICE_ID } from '../../static/const';

export const scrapeIndexedMarvelSeriesAction = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { series } = await getSeriesById(id);

  // all of this below assumes the series has a series service URL, need to factor in the NOT
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
};
