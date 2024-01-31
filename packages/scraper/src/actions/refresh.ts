import { Request, Response } from 'express';
import { getSeriesModelById } from '@justreadcomics/shared-node/dist/model/lookup';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';
import { refreshCorpoMetadata } from '../scrape/corpo';
import { CORPO_SERVICE_ID } from '@justreadcomics/common/dist/const';
import { ISeries } from '@justreadcomics/common/dist/types/series';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/shared-node/dist/s3/s3';

export const refreshCorpoMetadataAction = async (req: Request, res: Response) => {
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

    const corpoSeriesService = series.services?.id(CORPO_SERVICE_ID);
    if (corpoSeriesService && corpoSeriesService.seriesServiceUrl) {
      const fetchedMetadata = await refreshCorpoMetadata(corpoSeriesService.seriesServiceUrl);
      const updateObj: Partial<ISeries> = {};

      for (const [key, value] of Object.entries(fetchedMetadata)) {
        if (value) {
          if (typeof value !== 'object' || (typeof value === 'object' && value.length > 0)) {
            // @ts-expect-error - type matching doesn't like this
            updateObj[key] = value;
          }
        }
      }

      // TODO: Add scanner option to override this
      if (fetchedMetadata.imageUrl && !series.image) {
        series.image = await uploadSeriesImageFromUrlToS3(series.seriesName, fetchedMetadata.imageUrl);
      }

      series.set(updateObj);
      series.save();

      res
        .status(200)
        .json({ error: false, msg: `${series.seriesName} updated with refreshed metadata`, series: series.toJSON() });
    } else {
      res
        .status(200)
        .json({ error: true, msg: `${series.seriesName} not found on corpo, are you sure you meant to run this?` });
    }
  } catch (e: any) {
    logError(e);
    res.status(400).json({ error: true, msg: 'Something goofed when trying to refresh' });
  }
};
