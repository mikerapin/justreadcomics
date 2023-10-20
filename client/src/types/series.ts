import { IService } from './service';

export interface Creator {
  name: string;
  role: string;
  order: number;
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

export interface ISeriesWithImageUpload extends ISeries {
  imageBlob?: File;
}

export interface IHydratedSeries {
  series: ISeries;
  services: IService[];
  msg?: string;
}

export interface IGetAllSeriesWithCursor {
  data: IHydratedSeries[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
