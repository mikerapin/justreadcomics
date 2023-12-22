import { IClientSeries } from '../types/series';
import { DEFAULT_COVER_IMAGE, DEFAULT_SERVICE_IMAGE } from '../static/const';
import { IClientService } from '../types/service';

export const getSeriesImage = (series?: IClientSeries) => {
  return series?.image || DEFAULT_COVER_IMAGE;
};

export const getServiceImage = (service?: IClientService) => {
  return service?.image || DEFAULT_SERVICE_IMAGE;
};
