export enum ServiceType {
  PAID = 'paid',
  SUBSCRIPTION = ' subscription',
  FREE = 'free'
}

export interface IServices {
  serviceName: string;
  image?: string;
  siteUrl: string;
  type: ServiceType;
}
