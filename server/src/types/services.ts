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
