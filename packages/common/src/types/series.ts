import { HydratedSingleSubdocument, Types } from "mongoose";
import { IService } from "./services";

export interface Creator {
  name: string;
  role: string;
  order?: number;
}

export interface ISeriesService {
  _id: string;
  seriesServiceUrl?: string;
  lastScan?: string;
}

export type ISeriesServiceType = ISeriesService[] & {
  id: (id: string) => HydratedSingleSubdocument<ISeriesService>;
};

export interface ISeries {
  _id: Types.ObjectId;
  seriesName: string;
  description?: string;
  image?: string;
  ongoingSeries?: boolean;
  credits?: Creator[];
  services?: ISeriesServiceType;
  meta: {
    searches: number;
    clickOuts: number;
  };
  lastScan?: string;
}

export interface IHydratedSeries {
  series: ISeries;
  services: IService[] | object;
  msg?: string;
}
