import { Types } from 'mongoose';
import { Creator, ISeries } from './series';

export interface IQueue {
  _id?: Types.ObjectId;
  createdAt?: string;
  updatedAt?: string;

  credits?: Creator[];
  foundSeriesName?: string;
  imageUrl?: string;
  searchValue: string;
  seriesCreators?: string[];
  seriesDescription?: string;
  seriesId: string;
  seriesPageUrl?: string;
  serviceId: string;
  withinCU?: boolean;

  reviewedDate?: string;
  reviewStatus?: 'rejected' | 'accepted' | 'partial';
}

export interface IHydratedQueue extends IQueue {
  series: ISeries | null;
}
