import { IHydratedClientQueue } from '../types/queue';
import { hasBeenReviewed } from './queueStatus';
import { QueueFilterStatus } from '@justreadcomics/common/dist/types/queue';
import React from 'react';
import { IClientUserQueueReviewData } from '../types/user-queue';

export const getReviewStatus = (queue: IHydratedClientQueue | IClientUserQueueReviewData) => {
  if (hasBeenReviewed(queue)) {
    switch (queue.reviewStatus) {
      case QueueFilterStatus.REJECTED:
        return <i className="bi bi-x-octagon text-danger"></i>;
      case QueueFilterStatus.ACCEPTED:
        return <i className="bi bi-check-all text-success"></i>;
      case QueueFilterStatus.PARTIAL:
        return <i className="bi bi-check2 text-warning"></i>;
    }
  }
  return <i className="bi bi-envelope text-primary-emphasis"></i>;
};
