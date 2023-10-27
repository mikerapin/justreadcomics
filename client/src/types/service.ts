export enum ServiceType {
  FREE = 'free',
  PAID = 'paid',
  SUBSCRIPTION = 'subscription',
  NONE = 'none'
}

export interface IService {
  _id?: string;
  image?: string;
  searchUrl: string;
  serviceName: string;
  siteUrl: string;
  type: ServiceType;
}

export interface IServiceWithImageUpload extends IService {
  imageBlob?: File;
}

export interface IGetAllServicesWithCursor {
  data: IService[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
