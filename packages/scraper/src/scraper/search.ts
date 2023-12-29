import { Request, Response } from 'express';
import { searchScrapeCorpo } from '../scrape/corpo';
import { ISeriesServiceType } from '@justreadcomics/common/dist/types/series';
import { getSeriesModelById } from '@justreadcomics/common/dist/model/lookup';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/common/dist/s3/s3';
import { CORPO_SERVICE_ID, CU_SERVICE_ID } from '@justreadcomics/common/dist/const';
import { cleanSearch } from '../scrape/util';
import { distance } from 'closest-match';

export const searchAndScrapeCorpoAction = async (req: Request, res: Response) => {
  const id = req.params.id;
  const series = await getSeriesModelById(id);
  if (!series) {
    res.status(400).json({
      msg: "series doesn't exist, bub"
    });
    return;
  }

  const allowedDistance = 3;
  let searchValue = series.seriesName;

  if (req.params.cleanSearch) {
    const allowedDistance = 7;
    searchValue = cleanSearch(searchValue);
  }

  const { imageUrl, seriesPageUrl, withinCU, seriesCredits, seriesDescription, seriesName } = await searchScrapeCorpo(
    searchValue
  );

  // this is an UGLY comparison, but let's try it
  // get the distance between the initial series name and the series name
  if (seriesName && distance(searchValue, seriesName) > 5) {
    // CORPO_SERVICE_ID needs to be added to the queue here
    res.status(200).json({
      msg: `Found the series ${seriesName} but it does not match ${searchValue}. Queuing the data for manual approval.`
    });
    return;
  }

  if (seriesPageUrl) {
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

    if (imageUrl) {
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

    res.status(200).json({ msg: `${series.seriesName} updated!`, series });
  } else {
    res.status(200).json({ msg: 'Series not found in corpoland' });
  }
};
