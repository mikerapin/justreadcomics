import { Request, Response } from 'express';
import { getSeriesModelById } from '../series';
import { scrapeMarvelSeries } from '../../scrape/marvel';
import { uploadSeriesImageFromUrlToS3 } from '../../s3/s3';
import { IMAGE_SERVICE_ID, MARVEL_UNLIMITED_SERVICE_ID } from '../../static/const';
import { scrapeImageSeries } from '../../scrape/image';

export const scrapeIndexedMarvelSeriesAction = async (req: Request, res: Response) => {
  const id = req.params.id;
  const series = await getSeriesModelById(id);
  if (!series) {
    res.status(400).json({
      msg: "series doesn't exist, bub"
    });
    return;
  }

  // all of this below assumes the series has a series service URL, need to factor in the NOT
  //  indexed series eventually
  // This may be done using the `scrapeAndSearchMarvel` function in the scraper/marvel.ts... but it's imprecise

  const muService = await series.services?.id(MARVEL_UNLIMITED_SERVICE_ID);
  if (!series.services || !muService || !muService.seriesServiceUrl) {
    res.status(400).json({
      msg: "series doesn't exist or it ain't attached to Marvel, bub"
    });
    return;
  }

  const { imageUrl, description, date } = await scrapeMarvelSeries(muService.seriesServiceUrl);

  // TODO: add the data to the db
  if (imageUrl) {
    series.image = await uploadSeriesImageFromUrlToS3(series.seriesName, imageUrl);
  }

  if (description.length) {
    series.description = description;
  }

  muService.lastScan = new Date().toJSON();

  await series.save();

  res.status(200).json({ msg: `${series.seriesName} updated!`, series });
};

// this action only really gets credits and description, it's not great
export const scrapeIndexedImageSeriesAction = async (req: Request, res: Response) => {
  const id = req.params.id;
  const series = await getSeriesModelById(id);
  if (!series) {
    res.status(400).json({
      msg: "series doesn't exist, bub"
    });
    return;
  }

  const imageService = await series.services?.id(IMAGE_SERVICE_ID);
  if (!series.services || !imageService || !imageService.seriesServiceUrl) {
    res.status(400).json({
      msg: "series doesn't exist or it ain't attached to Marvel, bub"
    });
    return;
  }

  const { description, creators, date } = await scrapeImageSeries(imageService.seriesServiceUrl);

  if (description?.length) {
    series.description = description;
  }

  if (creators.length) {
    series.credits = creators.map((c, index) => {
      return {
        name: c,
        role: '',
        order: index
      };
    });
  }

  imageService.lastScan = new Date().toJSON();

  await series.save();

  // res.status(200).json({ msg: `${series.seriesName} updated!`, series });
  res.status(200).json({ msg: `${series.seriesName} updated!`, series });
};
