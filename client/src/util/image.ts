import { ISeries } from '../types/series';
import { DEFAULT_COVER_IMAGE, DEFAULT_SERVICE_IMAGE } from '../static/const';
import { IService } from '../types/service';

export const getCoverImage = (series?: ISeries) => {
  return series?.image || DEFAULT_COVER_IMAGE;
};

export const getServiceImage = (service?: IService) => {
  return service?.image || DEFAULT_SERVICE_IMAGE;
};
