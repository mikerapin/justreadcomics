enum ServiceType {
  FREE = "free",
  PAID = "paid",
  SUBSCRIPTION = " subscription",
}

export interface IService {
  image?: string;
  searchUrl: string;
  serviceName: string;
  siteUrl: string;
  type: ServiceType;
}
