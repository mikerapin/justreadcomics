import { IService } from './service';

export interface Creator {
  name: string;
  role: string;
}

export interface ISeries {
  _id?: string;
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

export interface IHydratedSeries {
  series: ISeries;
  services: IService[];
}

export interface IGetAllSeriesWithCursor {
  data: IHydratedSeries[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
