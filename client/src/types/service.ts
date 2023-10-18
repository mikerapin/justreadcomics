export enum ServiceType {
  FREE = 'free',
  PAID = 'paid',
  SUBSCRIPTION = ' subscription'
}

export interface IService {
  _id?: string;
  image?: string;
  searchUrl: string;
  serviceName: string;
  siteUrl: string;
  type: ServiceType;
}

export interface IGetAllServicesCursor {
  data: IService[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
