import { Request } from 'express';
import { ObjectId } from 'mongoose';
import { IService } from './services';

interface Creator {
  name: string;
  role: string;
  order?: number;
}

interface ISeries {
  seriesName: string;
  description?: string;
  image?: string;
  credits?: Creator[];
  services?: string[];
  meta: {
    searches: number;
    clickOuts: number;
  };
  lastScan?: string;
}

interface IHydratedSeries {
  series: ISeries;
  services: IService[] | object;
  msg?: string;
}

interface CreateSeriesRequest extends Request {
  body: ISeries;
}

export { IHydratedSeries, ISeries, CreateSeriesRequest };
