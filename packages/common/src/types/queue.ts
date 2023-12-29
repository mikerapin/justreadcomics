import { Types } from 'mongoose';
import { Creator, ISeries } from './series';

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

  reviewedDate?: string;
  reviewStatus?: ReviewStatus;
}

export interface IHydratedQueue extends IQueue {
  series: ISeries | null;
}

interface ISeriesUpdatableValues {
  seriesName?: string;
  seriesDescription?: string;
  credits?: Creator[];
  withinCU?: boolean;
  imageUrl?: string;
}

export interface IQueueReviewLog {
  _id?: Types.ObjectId;
  createdAt?: string;
  updatedAt?: string;

  queueId: string;
  seriesId: string;
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
}
