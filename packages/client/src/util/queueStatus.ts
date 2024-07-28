import { IHydratedClientQueue } from '../types/queue';
import { IClientUserQueueReviewData } from '../types/user-queue';

export const hasBeenReviewed = (queue: IHydratedClientQueue | IClientUserQueueReviewData) => {
  return Boolean(queue.reviewedDate && queue.reviewStatus);
};
