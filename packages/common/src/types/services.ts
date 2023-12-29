import { Types } from 'mongoose';

export enum ServiceType {
  FREE = 'free',
  PAID = 'paid',
  SUBSCRIPTION = 'subscription',
  NONE = 'none'
}

export interface IService {
  _id?: Types.ObjectId;
  image?: string;
  searchUrl: string;
  serviceName: string;
  siteUrl: string;
  type: ServiceType;
}
