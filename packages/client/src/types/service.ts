import { IService } from '@justreadcomics/common/dist/types/services';
import { IClientSeriesService } from './series';

export interface IClientService extends Omit<IService, '_id'> {
  _id?: string;
}

export interface IServiceWithImageUpload extends IClientService {
  imageBlob?: File;
}

export interface IGetAllServicesWithCursor {
  data: IClientService[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IClientServiceAndSeriesService {
  seriesService: IClientSeriesService;
  service: IClientService;
}
