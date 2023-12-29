import { Model, model, models, Schema } from 'mongoose';
import { IQueue } from '@justreadcomics/common/dist/types/queue';

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
    seriesCreators: String,
    seriesDescription: String,
    credits: {
      type: Array
    }
  },
  {
    timestamps: true
  }
);

const queueModel: Model<IQueue> = models.queue || model<IQueue>('queue', queueSchema);

export { queueModel };
