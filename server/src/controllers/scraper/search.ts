import { Request, Response } from 'express';
import { getSeriesById } from '../series';
import { searchScrapeCorpo } from '../../scrape/corpo';
import { uploadSeriesImageFromUrlToS3 } from '../../s3/s3';
import { CORPO_SERVICE_ID, CU_SERVICE_ID } from '../../static/const';

export const searchAndScrapeCorpoAction = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { series } = await getSeriesById(id);
  if (!series) {
    res.status(400).json({
      msg: "series doesn't exist, bub"
    });
    return;
  }

  const seriesName = series.seriesName;

  const { imageUrl, seriesPageUrl, withinCU } = await searchScrapeCorpo(seriesName, false);

  if (seriesPageUrl) {
    // if we have services
    if (series.services) {
      const corpoIndex = series.services?.findIndex((service) => {
        return service.id === CORPO_SERVICE_ID;
      });

      if (corpoIndex && corpoIndex > -1) {
        series.services[corpoIndex].seriesServiceUrl = seriesPageUrl;
        series.services[corpoIndex].lastScan = new Date().toJSON();
      } else {
        series.services.push({
          id: CORPO_SERVICE_ID,
          seriesServiceUrl: seriesPageUrl,
          lastScan: new Date().toJSON()
        });
      }
    } else {
      // if there are no services, add the corpo service
      series.services = [
        {
          id: CORPO_SERVICE_ID,
          seriesServiceUrl: seriesPageUrl,
          lastScan: new Date().toJSON()
        }
      ];
    }

    if (withinCU) {
      const cuIndex = series.services.findIndex((service) => {
        return service.id === CU_SERVICE_ID;
      });

      if (cuIndex && cuIndex > -1) {
        series.services[cuIndex].seriesServiceUrl = seriesPageUrl;
        series.services[cuIndex].lastScan = new Date().toJSON();
      } else {
        series.services.push({
          id: CU_SERVICE_ID,
          seriesServiceUrl: seriesPageUrl,
          lastScan: new Date().toJSON()
        });
      }
    }

    if (imageUrl && series.image === '') {
      series.image = await uploadSeriesImageFromUrlToS3(series.seriesName, imageUrl);
    }

    await series.save();

    res.status(200).json({ msg: `${series.seriesName} updated!`, series });
  } else {
    res.status(200).json({ msg: 'Series not found in corpoland' });
  }
};
