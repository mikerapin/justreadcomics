import { ISeries } from '@justreadcomics/common/dist/types/series';
import { IClientService } from './service';

export interface IClientSeriesService {
  _id: string;
  seriesServiceUrl?: string;
  lastScan?: string;
}

export interface IClientSeries extends Omit<ISeries, 'services' | '_id'> {
  _id?: string;
  services?: IClientSeriesService[];
}

export interface ISeriesWithImageUpload extends IClientSeries {
  imageBlob?: File;
}

export interface IHydratedSeries {
  series: IClientSeries;
  services: IClientService[];
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
