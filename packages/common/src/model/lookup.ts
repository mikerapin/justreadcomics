import { Types } from 'mongoose';
import { IHydratedSeries, ISeriesService } from "../types/series";
import { IService } from "../types/services";
import { servicesModel } from "./services";
import { seriesModel } from "./series";


export const lookupServicesForSeries = async (seriesServices?: ISeriesService[]): Promise<IService[] | object> => {
  if (!seriesServices) {
    return {};
  }
  const ids = seriesServices.map((seriesService) => seriesService._id);
  return servicesModel.find({ _id: { $in: ids } });
};

export const getSeriesModelById = async (id: string) => {
  return seriesModel.findOne({ _id: new Types.ObjectId(id) });
};

export const getHydratedSeriesById = async (id: string): Promise<IHydratedSeries | null> => {
  const series = await getSeriesModelById(id);
  if (!series) {
    return null;
  }

  const hydratedServices = await lookupServicesForSeries(series.services);

  return { series, services: hydratedServices };
};