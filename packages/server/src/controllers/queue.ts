import express, { Request, Response } from 'express';
import { verifyTokenMiddleware } from '@justreadcomics/shared-node/middleware/auth';
import { queueModel } from '@justreadcomics/shared-node/model/queue';
import { getSeriesModelById } from '@justreadcomics/common/dist/model/lookup';
import { Types } from 'mongoose';
import { IHydratedQueue, IQueue, IQueueReviewData, ReviewStatus } from '@justreadcomics/common/dist/types/queue';
import { logError } from '@justreadcomics/common/dist/util/logger';
import { seriesModel } from '@justreadcomics/common/dist/model/series';
import { uploadSeriesImageFromUrlToS3 } from '@justreadcomics/common/dist/s3/s3';
import { ISeries } from '@justreadcomics/common/dist/types/series';

const queueRouter = express.Router();

const getHydratedQueue = async (queue: IQueue): Promise<IHydratedQueue> => {
  const seriesData = await getSeriesModelById(queue.seriesId);

  return {
    ...queue,
    series: seriesData
  };
};

queueRouter.get('/get/all', [verifyTokenMiddleware], async (req: Request, res: Response) => {
  const queueList = await queueModel.find().sort('createdAt').limit(100);

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
    res.status(404).json({ msg: 'no queue here, bub' });
  }
});

interface ReviewQueueRequest extends Request {
  body: IQueueReviewData;
}

queueRouter.post('/review/:id', [verifyTokenMiddleware], async (req: ReviewQueueRequest, res: Response) => {
  const queueId = req.params.id;
  if (!queueId) {
    res.status(403).json({ msg: 'no id? no queue' });
    return;
  }

  const { seriesId, seriesName, description, imageUrl, credits, withinCU, reviewStatus } = req.body;

  try {
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

    const queue = await queueModel.findOneAndUpdate(
      { _id: new Types.ObjectId(queueId) },
      {
        reviewStatus,
        reviewedDate: new Date()
      },
      {
        // this ensures we return the UPDATED document *sigh*
        new: true
      }
    );

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

export { queueRouter };
