import { Request } from 'express';
import { ObjectId } from 'mongoose';

// interface GetSeriesById {
//   id: string;
// }
//
// interface GetSeriesByIdRequest extends Request {
//   params: GetSeriesById;
// }

enum ServiceType {
  PAID = 'paid',
  SUBSCRIPTION = ' subscription',
  FREE = 'free'
}

interface IServices {
  serviceName: string;
  image?: string;
  siteUrl: string;
  type: ServiceType;
}

interface CreateServiceRequest extends Request {
  body: IServices;
}

interface FindServices {
  serviceIds: string[];
}

interface FindServicesRequest extends Request {
  body: FindServices;
}

export { IServices, CreateServiceRequest, FindServicesRequest };
