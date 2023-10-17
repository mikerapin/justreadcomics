import { model, ObjectId, Schema } from 'mongoose';

interface SeriesSchema {
  seriesName: string;
  image?: string;
  credits?: {
    name: string;
    role: string;
  };
  services?: ObjectId[];
  meta: {
    searches: number;
    clickOuts: number;
  };
  lastScan?: string;
}

const seriesSchema = new Schema<SeriesSchema>(
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
    lastScan: Date
  },
  {
    timestamps: true
  }
);

const seriesModel = model<SeriesSchema>('comic_series', seriesSchema);

export { seriesModel };
