import { IService } from './service';

export interface Creator {
  name: string;
  role: string;
  order: number;
}

export interface ISeriesService {
  _id: string;
  seriesServiceUrl?: string;
  lastScan?: string;
}

export interface ISeries {
  _id?: string;
  seriesName: string;
  description?: string;
  image?: string;
  credits?: Creator[];
  services?: ISeriesService[];
  meta: {
    searches: number;
    clickOuts: number;
  };
  lastScan?: string;
}

export interface ISeriesWithImageUpload extends ISeries {
  imageBlob?: File;
}

export interface IHydratedSeries {
  series: ISeries;
  services: IService[];
  msg?: string;
}

export interface IGetThreeRandomSeries {
  data: IHydratedSeries[];
}

export interface IFetchMultipleSeriesWithCursor {
  data: IHydratedSeries[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
