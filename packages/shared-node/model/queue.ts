import { model, models, Schema } from 'mongoose';
import { IQueue } from '@justreadcomics/common/dist/types/queue';

// const queueSchema = new Schema<IQueue>();

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
    seriesName: String,
    imageUrl: String,
    seriesPageUrl: String,
    withinCU: Boolean,
    seriesCreators: String,
    seriesDescription: String
  },
  {
    timestamps: true
  }
);

const queueModel = models.queue || model<IQueue>('queue', queueSchema);

export { queueModel };
