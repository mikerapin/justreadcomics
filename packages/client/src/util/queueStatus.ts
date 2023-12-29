import { IHydratedClientQueue } from '../types/queue';

export const hasBeenReviewed = (queue: IHydratedClientQueue) => {
  return Boolean(queue.reviewedDate && queue.reviewStatus);
};
