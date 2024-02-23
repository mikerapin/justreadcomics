import { Types } from 'mongoose';
import { Creator, ISeries } from './series';
import { IService } from './services';

export enum QueueFilterType {
  USER = 'user',
  AUTO = 'auto'
}

export enum QueueFilterStatus {
  ACCEPTED = 'accepted',
  PARTIAL = 'partial',
  REJECTED = 'rejected'
}

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
  reviewStatus?: QueueFilterStatus;
  reviewType?: QueueFilterType;
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
  reviewStatus: QueueFilterStatus;
  addService?: boolean;
  seriesPageUrl?: string;
}
