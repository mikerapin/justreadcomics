import express, { Request, Response } from 'express';
import { verifyTokenMiddleware } from '@justreadcomics/shared-node/middleware/auth';
import { queueModel } from '@justreadcomics/shared-node/model/queue';
import { getSeriesModelById } from '@justreadcomics/common/dist/model/lookup';
import { Types } from 'mongoose';
import { IHydratedQueue, IQueue } from '@justreadcomics/common/dist/types/queue';

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

export { queueRouter };
