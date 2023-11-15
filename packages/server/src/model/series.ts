import { model, Schema } from 'mongoose';
import { ISeries, ISeriesService } from '../types/series';

const seriesServiceSchema = new Schema<ISeriesService>({
  seriesServiceUrl: String,
  lastScan: {
    type: Date,
    default: null
  }
});

const seriesSchema = new Schema<ISeries>(
  {
    seriesName: {
      required: true,
      type: String,
      index: true,
      unique: true
    },
    description: String,
    image: {
      type: String
    },
    credits: {
      type: Array
    },
    ongoingSeries: Boolean,
    services: [seriesServiceSchema],
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
