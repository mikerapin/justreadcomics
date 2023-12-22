import { IService } from '@justreadcomics/common/dist/types/services';

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
