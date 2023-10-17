import { IService, ServiceType } from '../types/service';

export const Services = ({ services }: { services?: IService[] }) => {
  if (!services) {
    return null;
  }
  const getServices = (type: ServiceType) => {
    const subscriptionServices = services.filter((service) => {
      return service.type === type;
    });
    return subscriptionServices.map((service) => (
      <div className="col-3 col-md-2">
        <a href="https://marvel.com/unlimited">
          <img className="img-thumbnail rounded-2 bg-white" src="/img/services/marvel-unlimited.png" alt="Marvel Unlimited" />
        </a>
      </div>
    ));
  };

  const getSubscriptionServices = () => {
    const filteredServices = getServices(ServiceType.SUBSCRIPTION);
    if (filteredServices.length) {
      return (
        <div className="row border-top border-bottom p-3">
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
  return (
    <div className="services pt-4 pb-4">
      <h3>Available on:</h3>
      {getFreeServices()}
      {getSubscriptionServices()}
      {getPaidServices()}
      <div className="row border-top border-bottom p-3">
        <h5>For purchase:</h5>
        <div className="col-3 col-md-2">
          <a href="https://amazon.com/comixology">
            <img className="img-thumbnail rounded-2 bg-white" src="/img/services/amazon.svg" alt="Amazon.com" />
          </a>
        </div>
      </div>
    </div>
  );
};
