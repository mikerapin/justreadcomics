import { Request, Response } from 'express';
import { searchScrapeCorpo } from '../scrape/corpo';
import { ISeriesServiceType } from '@justreadcomics/common/dist/types/series';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/shared-node/dist/s3/s3';
import { getSeriesModelById } from '@justreadcomics/shared-node/dist/model/lookup';
import { CORPO_SERVICE_ID, CU_SERVICE_ID } from '@justreadcomics/common/dist/const';
import { cleanSearch } from '../scrape/util';
import { distance } from 'closest-match';
import { queueModel } from '@justreadcomics/shared-node/dist/model/queue';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

export const searchAndScrapeCorpoAction = async (req: Request, res: Response) => {
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

    let allowedDistance = 3;
    let searchValue = series.seriesName;

    if (req.params.cleanedTitle) {
      allowedDistance = 7;
      searchValue = cleanSearch(searchValue);
    }

    const { imageUrl, seriesPageUrl, withinCU, seriesCredits, seriesDescription, seriesName } =
      await searchScrapeCorpo(searchValue);

    if (seriesPageUrl && seriesName) {
      // this is an UGLY comparison, but let's try it
      // get the distance between the initial series name and the series name
      const textDistance = distance(searchValue.trim().toLowerCase(), seriesName.trim().toLowerCase());
      if (textDistance >= allowedDistance) {
        const queue = new queueModel({
          seriesId: series.id,
          serviceId: CORPO_SERVICE_ID,
          searchValue,
          imageUrl,
          seriesPageUrl,
          withinCU,
          credits: seriesCredits,
          seriesDescription,
          foundSeriesName: seriesName,
          distance: textDistance
        });
        await queue.validate();
        await queue.save();

        // should we also update the scan date here for the series service??

        res.status(200).json({
          error: false,
          msg: `Found the series ${seriesName} but it does not match ${searchValue} (distance: ${textDistance}). Queuing the data for manual approval.`
        });
        return;
      }

      const corpoResults = {
        _id: CORPO_SERVICE_ID,
        seriesServiceUrl: seriesPageUrl,
        lastScan: new Date().toJSON()
      };

      if (series.services) {
        const corpoService = series.services.id(CORPO_SERVICE_ID);

        if (corpoService) {
          corpoService.seriesServiceUrl = corpoResults.seriesServiceUrl;
          corpoService.lastScan = corpoResults.lastScan;
        } else {
          series.services.push(corpoResults);
        }
      } else {
        series.services = [corpoResults] as ISeriesServiceType;
      }

      const cuService = series.services.id(CU_SERVICE_ID);
      const cuResults = {
        _id: CU_SERVICE_ID,
        seriesServiceUrl: seriesPageUrl,
        lastScan: new Date().toJSON()
      };

      if (withinCU) {
        if (cuService) {
          cuService.seriesServiceUrl = cuResults.seriesServiceUrl;
          cuService.lastScan = cuResults.lastScan;
        } else {
          series.services.push(cuResults);
        }
      } else {
        series.services.id(CU_SERVICE_ID)?.deleteOne();
      }

      // only update the image if it didn't already exist (to save space on s3...?)
      // TODO add scanner override option for this
      if (imageUrl && !series.image) {
        series.image = await uploadSeriesImageFromUrlToS3(series.seriesName, imageUrl);
      }
      if (seriesCredits) {
        // TODO this isn't working great, maybe fix it up a bit
        series.credits = seriesCredits;
      }
      if (seriesDescription) {
        series.description = seriesDescription;
      }

      await series.save();

      res.status(200).json({ error: false, msg: `${series.seriesName} updated!`, series });
    } else {
      res.status(200).json({ error: true, msg: 'Series not found in corpoland' });
    }
  } catch (e: any) {
    logError(e);
    res.status(400).json({ error: true, msg: 'Somethihg goofed when trying to scan' });
  }
};
