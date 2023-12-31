import { Types } from 'mongoose';
import { Creator, ISeries } from './series';
import { IService } from './services';

export type ReviewStatus = 'rejected' | 'accepted' | 'partial';

export interface IQueue {
  _id?: Types.ObjectId;
  createdAt?: string;
  updatedAt?: string;

  credits?: Creator[];
  foundSeriesName?: string;
  imageUrl?: string;
  searchValue: string;
  seriesDescription?: string;
  seriesId: string;
  seriesPageUrl?: string;
  serviceId: string;
  withinCU?: boolean;
  distance?: number;

  reviewedDate?: string;
  reviewStatus?: ReviewStatus;
}

export interface IHydratedQueue extends IQueue {
  series: ISeries | null;
  service: IService | null;
}

interface ISeriesUpdatableValues {
  seriesName?: string;
  seriesDescription?: string;
  credits?: Creator[];
  withinCU?: boolean;
  imageUrl?: string;
  seriesPageUrl?: string;
}

export interface IQueueReviewLog {
  _id?: Types.ObjectId;
  createdAt?: string;
  updatedAt?: string;

  queueId: string;
  seriesId: string;
  serviceId: string;
  newValues: ISeriesUpdatableValues;
  oldValues: ISeriesUpdatableValues;
}

export interface IQueueReviewData {
  seriesId: string;
  seriesName?: string;
  description?: string;
  imageUrl?: string;
  credits?: Creator[];
  withinCU?: boolean;
  reviewStatus: ReviewStatus;
  addService?: boolean;
  seriesPageUrl?: string;
}
