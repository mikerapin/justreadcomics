import express, { Request, Response } from 'express';
import { verifyTokenMiddleware } from '@justreadcomics/shared-node/middleware/auth';
import { queueModel } from '@justreadcomics/shared-node/model/queue';
import { getSeriesModelById } from '@justreadcomics/common/dist/model/lookup';

const queueRouter = express.Router();

queueRouter.get('/get/all', [verifyTokenMiddleware], async (req: Request, res: Response) => {
  const queueList = await queueModel.find().sort('createdAt').limit(100);

  const hydratedQueues = queueList.map(async (queue) => {
    const seriesData = await getSeriesModelById(queue.seriesId);
    return {
      ...queue._doc, // this ensures we only return the document data and not the entire Query object (there may be a better way to do this)
      series: seriesData
    };
  });

  const data = {
    data: await Promise.all(hydratedQueues)
  };
  res.status(200).json(data);
});

export { queueRouter };
