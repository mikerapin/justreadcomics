import { model, Schema } from 'mongoose';
import { ISeries } from '../types/series';

const seriesSchema = new Schema<ISeries>(
  {
    seriesName: {
      required: true,
      type: String
    },
    description: String,
    image: {
      type: String
    },
    credits: {
      type: Object
    },
    services: Array,
    meta: {
      searches: {
        type: Number,
        default: 0
      },
      clickOuts: {
        type: Number,
        default: 0
      }
    },
    lastScan: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const seriesModel = model<ISeries>('comic_series', seriesSchema);

export { seriesModel };
