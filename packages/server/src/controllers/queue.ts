import express, { Request, Response } from 'express';
import { verifyTokenMiddleware } from '@justreadcomics/shared-node/dist/middleware/auth';
import { getServiceModelById, getSeriesModelById } from '@justreadcomics/shared-node/dist/model/lookup';
import { seriesModel } from '@justreadcomics/shared-node/dist/model/series';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/shared-node/dist/s3/s3';
import { Types } from 'mongoose';
import {
  IHydratedQueue,
  IQueue,
  IQueueReviewData,
  QueueFilterStatus,
  QueueFilterType
} from '@justreadcomics/common/dist/types/queue';
import { ISeries } from '@justreadcomics/common/dist/types/series';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';
import { queueModel } from '@justreadcomics/shared-node/dist/model/queue';
import { insertOrUpdateSeriesService } from '@justreadcomics/shared-node/dist/util/scraper';

const queueRouter = express.Router();

interface ReviewQueueRequest extends Request {
  body: IQueueReviewData;
}

const getHydratedQueue = async (queue: IQueue): Promise<IHydratedQueue> => {
  const seriesData = await getSeriesModelById(queue.seriesId);
  const serviceData = await getServiceModelById(queue.serviceId);

  return {
    ...queue,
    series: seriesData,
    service: serviceData
  };
};

queueRouter.get('/get/all', [verifyTokenMiddleware], async (req: Request, res: Response) => {
  const filterStatus = req.query.status;
  const filterType = req.query.type;

  const filterObject: Partial<IQueue> = {};
  if (filterStatus) {
    filterObject.reviewStatus = filterStatus as QueueFilterStatus;
  }
  if (filterType) {
    filterObject.reviewType = filterType as QueueFilterType;
  }

  console.log(filterObject);

  const queueList = await queueModel.find(filterObject).sort('createdAt').limit(100).sort({ createdAt: -1 });
  const hydratedQueues = queueList.map(async (queue) => await getHydratedQueue(queue.toObject()));

  const data = {
    data: await Promise.all(hydratedQueues)
  };
  res.status(200).json(data);
});

queueRouter.get('/get/:id', [verifyTokenMiddleware], async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(403).json({ msg: 'no id? no queue' });
    return;
  }
  const queueData = await queueModel.findOne({ _id: new Types.ObjectId(id) });

  if (queueData) {
    const hydratedQueue = await getHydratedQueue(queueData.toObject());
    res.status(200).json({ data: hydratedQueue });
  } else {
    res.status(404).json({ msg: 'no queue here, bub', data: {} });
  }
});

queueRouter.post('/review/:id', [verifyTokenMiddleware], async (req: ReviewQueueRequest, res: Response) => {
  const queueId = req.params.id;
  if (!queueId) {
    res.status(403).json({ msg: 'no id? no queue' });
    return;
  }

  const { seriesId, seriesName, description, imageUrl, credits, withinCU, reviewStatus, addService } = req.body;

  try {
    const queue = await queueModel.findOne({ _id: new Types.ObjectId(queueId) });
    if (!queue) {
      res.status(403).json({ msg: 'no queue found, bub' });
      return;
    }
    const seriesUpdateObject: Partial<ISeries> = {
      seriesName,
      description,
      credits
    };

    if (seriesName && imageUrl && !imageUrl?.match(/justreadcomics/gi)) {
      seriesUpdateObject.image = await uploadSeriesImageFromUrlToS3(seriesName, imageUrl);
    }

    const series = await seriesModel.findOneAndUpdate({ _id: new Types.ObjectId(seriesId) }, seriesUpdateObject, {
      // this ensures we return the UPDATED document *sigh*
      new: true
    });

    const seriesPageUrl = queue.get('seriesPageUrl');

    if (series && addService && seriesPageUrl) {
      const serviceID = queue.serviceId;
      insertOrUpdateSeriesService(series, serviceID, seriesPageUrl);
    }

    queue.reviewStatus = reviewStatus;
    queue.reviewedDate = new Date().toJSON();

    if (queue && series) {
      await series.validate();
      await queue.validate();
      await series.save();
      const updatedQueue = await queue.save();

      res.status(200).json({
        msg: 'Success updating the queue and series',
        error: false,
        queue: await getHydratedQueue(updatedQueue.toObject())
      });
    } else {
      logError('error finding and updating the series or queue');
      res.status(400).json({ error: true, msg: 'error finding and updating the series or queue' });
    }
  } catch (e: any) {
    logError(e);
    res.status(400).json({ error: true, msg: 'There was an error updating the queue' });
  }
});

queueRouter.post('/review/:id/reject', [verifyTokenMiddleware], async (req: Request, res: Response) => {
  const queueId = req.params.id;
  if (!queueId) {
    res.status(403).json({ msg: 'no id? no queue' });
    return;
  }
  try {
    const queue = await queueModel.findOneAndUpdate(
      { _id: new Types.ObjectId(queueId) },
      {
        reviewStatus: 'rejected',
        reviewedDate: new Date()
      },
      {
        // this ensures we return the UPDATED document *sigh*
        new: true
      }
    );
    if (queue) {
      await queue.validate();
      const updatedQueue = await queue.save();

      res.status(200).json({
        msg: 'Queue has been marked as "rejected"',
        error: false,
        queue: await getHydratedQueue(updatedQueue.toObject())
      });
    } else {
      logError('error finding and updating the queue');
      res.status(400).json({ error: true, msg: 'error finding and updating the queue' });
    }
  } catch (e: any) {
    logError(e);
    res.status(400).json({ error: true, msg: 'There was an error updating the queue' });
  }
});

export { queueRouter };
