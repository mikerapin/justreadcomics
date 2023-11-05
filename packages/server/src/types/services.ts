import { Request } from 'express';

enum ServiceType {
  FREE = 'free',
  PAID = 'paid',
  SUBSCRIPTION = ' subscription'
}

interface IService {
  image?: string;
  searchUrl: string;
  serviceName: string;
  siteUrl: string;
  type: ServiceType;
}

interface IServiceRequestBody extends IService {
  imageBlob?: File[];
}

interface CreateServiceRequest extends Request {
  body: IServiceRequestBody;
}

interface FindServices {
  serviceIds: string[];
}

interface FindServicesRequest extends Request {
  body: FindServices;
}

export { IService, CreateServiceRequest, FindServicesRequest };
