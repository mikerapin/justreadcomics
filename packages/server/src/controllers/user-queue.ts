import express, { Response, Request } from 'express';
import { verifyTokenMiddleware } from '@justreadcomics/shared-node/dist/middleware/auth';
import { IUserQueueReviewData } from '@justreadcomics/common/dist/types/queue';

interface UserQueueSubmissionRequest extends Request {
  body: IUserQueueReviewData;
}

const userQueueRouter = express.Router();

userQueueRouter.post('/submit', [verifyTokenMiddleware], async (req: UserQueueSubmissionRequest, res: Response) => {
  console.log(req.body);
  res.status(200).json({ msg: 'nice', error: false });
});

export { userQueueRouter };
