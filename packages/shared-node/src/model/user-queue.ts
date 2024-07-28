import { model, Model, models, Schema } from 'mongoose';
import { IUserQueue } from '@justreadcomics/common/dist/types/user-queue';
import { seriesServiceSchema } from './series';

const userQueueSchema = new Schema<IUserQueue>(
  {
    userId: String,
    seriesId: {
      required: true,
      type: String
    },
    seriesName: {
      required: true,
      type: String
    },
    description: String,
    imageUrl: String,
    credits: {
      type: Array
    },
    services: [seriesServiceSchema],
    ongoingSeries: Boolean,
    reviewedDate: Date,
    reviewStatus: String
  },
  {
    timestamps: true
  }
);

const userQueueModel: Model<IUserQueue> = models.userQueue || model<IUserQueue>('userQueue', userQueueSchema);

export { userQueueModel };
