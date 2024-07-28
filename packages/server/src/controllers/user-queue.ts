import express, { Response, Request } from 'express';
import { verifyTokenMiddleware } from '@justreadcomics/shared-node/dist/middleware/auth';
import { IUserQueueReviewData } from '@justreadcomics/common/dist/types/queue';
import { confirmIdFromBodyAndFetchSeries } from '@justreadcomics/shared-node/dist/middleware/refreshFetch';
import { logError } from '@justreadcomics/shared-node/dist/util/logger';
import { userQueueModel } from '@justreadcomics/shared-node/dist/model/user-queue';
import { Types } from 'mongoose';
import { getSeriesModelById, lookupServicesForSeries } from '@justreadcomics/shared-node/dist/model/lookup';

interface UserQueueSubmissionRequest extends Request {
  body: IUserQueueReviewData;
}

const userQueueRouter = express.Router();

/*
NEXT STEPS:
- Create a new User Review Schema
- This router can be used for fetching, approving, rejecting just like the other queue router
- Probably will want to just add a new page in the admin to review these submissions and approve them the same way we do other queues (lotta work, but WORTH it)
 - Same filtering and approval process (partial, full, rejected) as the other queue page
 - Keep score of who submits, what gets approved, etc.
 - Full/Partial logic will need to be different because if someone only adds one new piece of info and we accept it, that's a full acceptance
 - Filter the parts of a submission on what already exists in the DB (hard text comparisons, probably is easiest)
 - EVENTUALLY (not mvp)
    - we can aggregate these acceptance rates and do some user graphing or something (esp for filtering rejections)
    - And we can list users and show their number of approvals, rejections, etc. when we get there...
*/
userQueueRouter.post(
  '/submit',
  [verifyTokenMiddleware, confirmIdFromBodyAndFetchSeries],
  async (req: UserQueueSubmissionRequest, res: Response) => {
    try {
      const fetchedSeries = res.locals.series;
      const queueId = req.query.qid as string;
      const { seriesId, seriesName, services, credits, seriesDescription, imageUrl, ongoingSeries } = req.body;

      const queueData = {
        seriesId,
        seriesName,
        services,
        seriesDescription,
        credits,
        ongoingSeries,
        imageUrl
      };

      // TODO: Replace with real user ids?
      const user = res.locals.auth.username;

      let userQueue;

      if (queueId) {
        userQueue = await userQueueModel.findOne({ _id: new Types.ObjectId(queueId), userId: user });

        if (userQueue) {
          userQueue.set(queueData);
        } else {
          res.status(400).json({ error: true, msg: "wtf do you think you're doing????" });
          return;
        }
      } else {
        userQueue = new userQueueModel({
          ...queueData,
          userId: user
        });
      }

      await userQueue.save();

      res.status(200).json({
        msg: `Data submitted for ${fetchedSeries.seriesName}`,
        error: false,
        data: { queueId: userQueue._id }
      });
    } catch (e) {
      logError(e);
      res.status(500).json({ msg: 'Something went wrong saving your data, bub...', error: true });
    }
  }
);

userQueueRouter.get('/client-fetch/:id', [verifyTokenMiddleware], async (req: Request, res: Response) => {
  const id = req.params.id;
  const queueId = req.query.qid as string;
  if (!id) {
    res.status(404).json({
      msg: 'wtf bud? no data here',
      error: true
    });
    return;
  }

  try {
    if (queueId) {
      const userQueue = await userQueueModel.findOne({ _id: new Types.ObjectId(queueId) });
      res.status(200).json({ msg: 'dis is user queue', error: false, data: userQueue });
      return;
    }
    const userQueue = await userQueueModel.findOne({ seriesId: id });
    res.status(200).json({ msg: '', error: false, data: userQueue });
  } catch (e) {
    logError(e);
    res.status(500).json({ msg: 'Something went wrong fetching your data, bub...', error: true });
  }
});

userQueueRouter.get('/get/all', [verifyTokenMiddleware], async (req: Request, res: Response) => {
  try {
    const userQueues = await userQueueModel.find().sort('createdAt').limit(100).sort({ createdAt: -1 });
    const hydratedUserQueues = userQueues.map(async (queue) => {
      const seriesData = await getSeriesModelById(queue.seriesId);
      const newServices = await lookupServicesForSeries(queue.services);
      const currentServices = await lookupServicesForSeries(seriesData?.services);

      return {
        _id: queue.id,
        seriesId: queue.seriesId,
        seriesDescription: queue.description,
        seriesName: queue.seriesName,
        userId: queue.userId,
        credits: queue.credits,
        createdAt: queue.createdAt,
        series: seriesData,
        newServices,
        currentServices
      };
    });

    res.status(200).json({ msg: '', error: false, data: await Promise.all(hydratedUserQueues) });
  } catch (e) {
    logError(e);
    res.status(500).json({ msg: 'Something went wrong fetching your data, bub...', error: true });
  }
});

export { userQueueRouter };
