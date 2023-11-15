import { Request } from 'express';
import { ObjectId } from 'mongoose';
import { IService } from './services';

interface Creator {
  name: string;
  role: string;
  order?: number;
}

export interface ISeriesService {
  _id: string;
  seriesServiceUrl?: string;
  lastScan?: string;
}

interface ISeries {
  seriesName: string;
  description?: string;
  image?: string;
  ongoingSeries?: boolean;
  credits?: Creator[];
  services?: ISeriesService[];
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
