import { Model, model, models, Schema } from 'mongoose';
import { IQueue, IQueueReviewLog } from '@justreadcomics/common/dist/types/queue';

export const queueSchema = new Schema<IQueue>(
  {
    seriesId: {
      required: true,
      type: String
    },
    searchValue: {
      type: String,
      required: true
    },
    foundSeriesName: String,
    imageUrl: String,
    seriesPageUrl: String,
    withinCU: Boolean,
    seriesDescription: String,
    credits: {
      type: Array
    },
    distance: Number,
    reviewedDate: Date,
    reviewStatus: String
  },
  {
    timestamps: true
  }
);

export const queueReviewLogSchema = new Schema<IQueueReviewLog>(
  {
    queueId: {
      required: true,
      type: String
    },
    seriesId: {
      required: true,
      type: String
    },
    newValues: {
      type: Object
    },
    oldValues: {
      type: Object
    }
  },
  {
    timestamps: true
  }
);

const queueModel: Model<IQueue> = models.queue || model<IQueue>('queue', queueSchema);
const queueReviewLogModel: Model<IQueue> =
  models.queue_review_log || model<IQueueReviewLog>('queue_review_log', queueReviewLogSchema);

export { queueModel, queueReviewLogModel };
