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

interface IService {
  serviceName: string;
  image?: string;
  siteUrl: string;
  type: ServiceType;
}

interface CreateServiceRequest extends Request {
  body: IService;
}

interface FindServices {
  serviceIds: string[];
}

interface FindServicesRequest extends Request {
  body: FindServices;
}

export { IService, CreateServiceRequest, FindServicesRequest };
