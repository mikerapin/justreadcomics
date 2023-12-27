import { Request, Response } from 'express';
import { searchScrapeCorpo } from '../scrape/corpo';
import { ISeriesServiceType } from '@justreadcomics/common/dist/types/series';
import { getSeriesModelById } from '@justreadcomics/common/dist/model/lookup';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/common/dist/s3/s3';
import { CORPO_SERVICE_ID, CU_SERVICE_ID } from '@justreadcomics/common/dist/const';

export const searchAndScrapeCorpoAction = async (req: Request, res: Response) => {
  const id = req.params.id;
  const series = await getSeriesModelById(id);
  if (!series) {
    res.status(400).json({
      msg: "series doesn't exist, bub"
    });
    return;
  }

  const seriesName = series.seriesName;

  const { imageUrl, seriesPageUrl, withinCU, seriesCreators, seriesDescription } = await searchScrapeCorpo(seriesName);

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
    if (seriesCreators) {
      // TODO this isn't working great, maybe fix it up a bit
      series.credits = seriesCreators;
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
