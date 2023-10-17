import { Request } from 'express';
import { ObjectId } from 'mongoose';

interface Creator {
  name: string;
  role: string;
}

interface ISeriesSchema {
  seriesName: string;
  image?: string;
  credits?: Creator[];
  services?: string[];
  meta: {
    searches: number;
    clickOuts: number;
  };
  lastScan?: string;
}

interface CreateSeriesRequest extends Request {
  body: ISeriesSchema;
}

export { ISeriesSchema, CreateSeriesRequest };
