import { Request } from 'express';
import { ObjectId } from 'mongoose';

// interface GetSeriesById {
//   id: string;
// }
//
// interface GetSeriesByIdRequest extends Request {
//   params: GetSeriesById;
// }

interface IServicesSchema {
  serviceName: string;
  image?: string;
  siteUrl: string;
}

interface CreateServiceRequest extends Request {
  body: IServicesSchema;
}

interface FindServices {
  serviceIds: string[];
}

interface FindServicesRequest extends Request {
  body: FindServices;
}

export { IServicesSchema, CreateServiceRequest, FindServicesRequest };
