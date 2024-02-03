import express, { Request, Response } from 'express';
import { Types } from 'mongoose';

import {
  getHydratedSeriesById,
  getSeriesModelById,
  getServiceModelById,
  lookupServicesForSeries
} from '@justreadcomics/shared-node/dist/model/lookup';
import { IHydratedSeries, ISeries } from '@justreadcomics/common/dist/types/series';
import { verifyTokenMiddleware } from '@justreadcomics/shared-node/dist/middleware/auth';
import { seriesModel } from '@justreadcomics/shared-node/dist/model/series';
import { upload } from '@justreadcomics/shared-node/dist/util/multer';
import { uploadImageToS3 } from '@justreadcomics/shared-node/dist/s3/s3';
import { escapeRegex } from '@justreadcomics/common/dist/util/util';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';

interface CreateSeriesRequest extends Request {
  body: ISeries;
}

interface UpdateSeriesServiceRequest extends Request {
  body: {
    seriesServiceUrl: string;
  };
}

const seriesRouter = express.Router();

// GetAll Method
seriesRouter.get('/get/all', async (req: Request, res: Response) => {
  let skip = 0;
  const cursor = parseInt(req.query.cursor as string, 10) || 0;
  if (cursor > 0) {
    skip = cursor * 50;
  }
  const seriesLookup = await seriesModel.find().sort('seriesName').skip(skip).limit(51);
  let hasNextPage = false;
  if (seriesLookup.length === 51) {
    hasNextPage = true;
    seriesLookup.pop();
  }

  if (seriesLookup.length === 0) {
    res.status(200).json({});
    return;
  }

  const hydratedSeries: Promise<IHydratedSeries>[] = seriesLookup.map(async (s) => {
    const hydratedServices = await lookupServicesForSeries(s?.services);
    return {
      series: s,
      services: hydratedServices
    };
  });

  const findResults = {
    data: await Promise.all(hydratedSeries),
    hasNextPage,
    hasPrevPage: cursor > 0
  };
  res.status(200).json(findResults);
});

// Get by ID Method
seriesRouter.get('/get/:id', async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json({ msg: 'no id? no data' });
  }
  const results = await getHydratedSeriesById(req.params.id);
  if (!results) {
    res.status(404).json({ msg: 'nothing found, sorry', services: {}, series: {} });
    return;
  }
  res.status(200).json(results);
});

seriesRouter.post('/create', [verifyTokenMiddleware], async (req: CreateSeriesRequest, res: Response) => {
  const { seriesName, description, image, credits, services, meta, lastScan } = req.body;
  try {
    const newSeries = new seriesModel({
      seriesName,
      description,
      image,
      credits,
      services,
      meta,
      lastScan
    });

    await newSeries.validate();

    const savedSeries = await newSeries.save();

    const hydratedServices = await lookupServicesForSeries(services);
    res.status(200).json({ series: savedSeries, services: hydratedServices });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

seriesRouter.patch(
  '/update-image/:id',
  [verifyTokenMiddleware, upload.single('imageBlob')],
  async (req: Request, res: Response) => {
    try {
      let fileUrl;
      if (req.file) {
        // upload file we received to S3 and get url to add to db
        fileUrl = await uploadImageToS3({
          image: req.file.buffer,
          filename: req.file.originalname || '',
          path: 'series/'
        });
      }

      const updatedSeries = await seriesModel.findOneAndUpdate(
        { _id: new Types.ObjectId(req.params.id) },
        {
          image: fileUrl
        },
        {
          // this ensures we return the UPDATED document *sigh*
          new: true
        }
      );

      if (updatedSeries) {
        await updatedSeries.validate();
        const savedSeries = await updatedSeries.save();
        res.status(200).json(savedSeries);
      } else {
        res.status(404).json({ message: 'series with id:' + req.params.id + ' not found, sorry dude' });
      }
    } catch (err: any) {
      res.status(400).json(err);
    }
  }
);

seriesRouter.patch('/update/:id', [verifyTokenMiddleware], async (req: CreateSeriesRequest, res: Response) => {
  const { seriesName, description, image, credits, services, meta, lastScan } = req.body;
  try {
    const series = await seriesModel.findOneAndUpdate(
      { _id: new Types.ObjectId(req.params.id) },
      {
        seriesName,
        description,
        image,
        credits,
        services,
        meta,
        lastScan
      },
      {
        // this ensures we return the UPDATED document *sigh*
        new: true
      }
    );
    if (series) {
      const hydratedServices = await lookupServicesForSeries(series.services);

      res.status(200).json({ series: series, services: hydratedServices });
    } else {
      res.status(404).json({ message: 'series with id:' + req.params.id + ' not found, sorry dude' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

seriesRouter.patch('/update/:id/series-service/:serviceId', async (req: UpdateSeriesServiceRequest, res: Response) => {
  const { seriesServiceUrl } = req.body;
  const seriesServiceId = req.params.serviceId;
  const seriesId = req.params.id;
  const newSeriesService = {
    _id: seriesServiceId,
    seriesServiceUrl
  };

  if (!seriesServiceId || !seriesId) {
    res.status(404).json({ error: true, message: `missing the series id or the service id, idk what to say...` });
    return;
  }

  try {
    const series = await getSeriesModelById(seriesId);
    const service = await getServiceModelById(seriesServiceId);
    if (series && service) {
      const seriesService = series.services?.id(seriesServiceId);
      if (seriesService) {
        // update series service
        seriesService.seriesServiceUrl = seriesServiceUrl;
        await seriesService.save();
      } else {
        if (series.services) {
          series.services.push(newSeriesService);
        } else {
          series.set({ services: [newSeriesService] });
        }
      }
      await series.save();
      const hydratedServices = await lookupServicesForSeries(series.services);

      res.status(200).json({ series: series, services: hydratedServices });
    } else {
      res.status(404).json({ error: true, message: `could not find ${seriesId} using service id ${seriesServiceId}` });
    }
  } catch (error: any) {
    logError(error);
    res.status(400).json({ message: error.message });
  }
});

// Search by name Method
seriesRouter.get('/get-name/:name', async (req: Request, res: Response) => {
  const { name } = req.params;

  // the frontend should prevent searching with less than 2 characters, but just in case...
  if (name.length < 2) {
    res.status(200).json();
  }

  const isLargeSearch = req.query.isLargeSearch || false;
  const limit = isLargeSearch ? 50 : 10;
  const skipCount = req.query.cursor && isLargeSearch ? limit * parseInt(req.query.cursor as string, 10) : 0;

  const regex = new RegExp(escapeRegex(name), 'gi');
  const series = await seriesModel
    .find({ seriesName: regex })
    .limit(limit + 1)
    .skip(skipCount);

  const hasPrevPage = skipCount > 0;
  let hasNextPage = false;
  if (series.length === limit + 1) {
    series.pop();
    hasNextPage = true;
  }

  const hydratedSeries: Promise<IHydratedSeries>[] = series.map(async (s) => {
    const hydratedServices = await lookupServicesForSeries(s?.services);
    return {
      series: s,
      services: hydratedServices
    };
  });

  res.status(200).json({ data: await Promise.all(hydratedSeries), hasPrevPage, hasNextPage });
});

seriesRouter.get('/get-3', async (req: Request, res: Response) => {
  // Get the count of all users
  const random3 = await seriesModel.aggregate([{ $sample: { size: 3 } }]);

  const hydratedSeries: Promise<IHydratedSeries>[] = random3.map(async (s) => {
    const hydratedServices = await lookupServicesForSeries(s?.services);
    return {
      series: s,
      services: hydratedServices
    };
  });
  res.status(200).json({ data: await Promise.all(hydratedSeries) });
});

export { getHydratedSeriesById, seriesRouter };
