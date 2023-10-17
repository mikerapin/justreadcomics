import { model, Schema } from 'mongoose';
import { ISeriesSchema } from '../types/series';

const seriesSchema = new Schema<ISeriesSchema>(
  {
    seriesName: {
      required: true,
      type: String
    },
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

const seriesModel = model<ISeriesSchema>('comic_series', seriesSchema);

export { seriesModel };
