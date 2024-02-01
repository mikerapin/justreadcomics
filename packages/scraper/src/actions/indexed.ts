import { Request, Response } from 'express';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/shared-node/dist/s3/s3';
import { getSeriesModelById } from '@justreadcomics/shared-node/dist/model/lookup';
import { scrapeMarvelSeries } from '../scrape/marvel';
import {
  IMAGE_SERVICE_ID,
  MARVEL_UNLIMITED_SERVICE_ID,
  SHONEN_JUMP_SERVICE_ID
} from '@justreadcomics/common/dist/const';
import { scrapeImageSeries } from '../scrape/image';
import { scrapeShonenJumpSeries } from '../scrape/shonen-jump';

const getSeriesAndSeriesService = async (seriesId: string, serviceId: string) => {
  const series = await getSeriesModelById(seriesId);
  if (!series) {
    return {
      msg: "series doesn't exist, bub",
      series: null,
      seriesService: null
    };
  }

  const seriesService = series.services?.id(serviceId);
  if (!series.services || !seriesService || !seriesService.seriesServiceUrl) {
    return {
      msg: "service ain't attached to that series",
      series: null,
      seriesService: null
    };
  }

  return {
    msg: '',
    series,
    seriesService
  };
};

// this action only really gets credits and description, it's not great
export const scrapeIndexedImageSeriesAction = async (req: Request, res: Response) => {
  const { series, seriesService, msg } = await getSeriesAndSeriesService(req.params.id, IMAGE_SERVICE_ID);

  if (series && seriesService && seriesService.seriesServiceUrl) {
    const { description, creators, date } = await scrapeImageSeries(seriesService.seriesServiceUrl);

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

    seriesService.lastScan = new Date().toJSON();

    await series.save();

    // res.status(200).json({ msg: `${series.seriesName} updated!`, series });
    res.status(200).json({ msg: `${series.seriesName} updated!`, series });
  } else {
    res.status(404).json({ msg });
  }
};

export const scrapeIndexedShonenJumpSeriesAction = async (req: Request, res: Response) => {
  const { series, seriesService, msg } = await getSeriesAndSeriesService(req.params.id, SHONEN_JUMP_SERVICE_ID);

  if (series && seriesService && seriesService.seriesServiceUrl) {
    const { imageUrl, description, creators } = await scrapeShonenJumpSeries(seriesService.seriesServiceUrl, false);

    if (description?.length) {
      series.description = description;
    }

    if (imageUrl) {
      series.image = await uploadSeriesImageFromUrlToS3(series.seriesName, imageUrl);
    }

    if (creators?.length) {
      series.credits = creators.map((c, index) => {
        return {
          name: c,
          role: '',
          order: index
        };
      });
    }

    seriesService.lastScan = new Date().toJSON();

    series.save();

    res.status(200).json({ msg: `${series.seriesName} updated!`, series });
  } else {
    res.status(404).json({ msg });
  }
};
