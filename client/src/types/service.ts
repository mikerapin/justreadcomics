export enum ServiceType {
  PAID = 'paid',
  SUBSCRIPTION = ' subscription',
  FREE = 'free'
}

export interface IService {
  serviceName: string;
  image?: string;
  siteUrl: string;
  type: ServiceType;
}
