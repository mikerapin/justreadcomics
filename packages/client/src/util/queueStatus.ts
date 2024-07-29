import { IHydratedClientQueue } from '../types/queue';
import { IClientUserQueueReviewData, IClientUserSubmissionListData } from '../types/user-queue';

export const hasBeenReviewed = (queue: IHydratedClientQueue | IClientUserSubmissionListData) => {
  return Boolean(queue.reviewedDate && queue.reviewStatus);
};
