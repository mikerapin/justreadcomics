import { IClientSeriesService } from '../types/series';

export const getSeriesServiceStringArray = (seriesServices?: IClientSeriesService[]) => {
  return (
    seriesServices?.map((service) => {
      return service._id;
    }) || []
  );
};
