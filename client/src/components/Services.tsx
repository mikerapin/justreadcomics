import { IService, ServiceType } from '../types/service';
import { getServiceImage } from '../util/image';

export const Services = ({ services }: { services?: IService[] }) => {
  if (!services || services.length === 0) {
    return null;
  }
  const getServices = (type: ServiceType) => {
    const subscriptionServices = services.filter((service) => {
      return service.type === type;
    });
    return subscriptionServices.map((service) => (
      <div key={service.serviceName} className="col-3 col-md-2">
        <a target="_blank" rel="noreferrer" href={service.siteUrl}>
          <img className="img-thumbnail rounded-2 bg-white" src={getServiceImage(service)} alt={service.serviceName} title={service.serviceName} />
        </a>
      </div>
    ));
  };

  const getSubscriptionServices = () => {
    const filteredServices = getServices(ServiceType.SUBSCRIPTION);
    if (filteredServices.length) {
      return (
        <div className="row border-top p-3">
          <h5>Subscription:</h5>
          {filteredServices}
        </div>
      );
    }
  };

  const getFreeServices = () => {
    const filteredServices = getServices(ServiceType.FREE);
    if (filteredServices.length) {
      return (
        <div className="row border-top border-bottom p-3">
          <h5>Free:</h5>
          {filteredServices}
        </div>
      );
    }
  };

  const getPaidServices = () => {
    const filteredServices = getServices(ServiceType.PAID);
    if (filteredServices.length) {
      return (
        <div className="row border-top border-bottom p-3">
          <h5>For Purchase:</h5>
          {filteredServices}
        </div>
      );
    }
  };

  if (!services) {
    return <></>;
  }

  return (
    <div className="services pt-4 pb-4">
      <h3>Available on:</h3>
      {getFreeServices()}
      {getSubscriptionServices()}
      {getPaidServices()}
    </div>
  );
};
