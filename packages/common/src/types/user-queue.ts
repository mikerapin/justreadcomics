import { Types } from 'mongoose';
import { ISeries } from './series';
import { QueueFilterStatus, QueueFilterType } from './queue';

export interface IUserQueue extends Omit<ISeries, '_id' | 'image' | 'meta' | 'lastScan'> {
  _id?: Types.ObjectId;
  seriesId: string;
  userId: string;
  imageUrl: string;
  reviewedDate?: string;
  reviewStatus?: QueueFilterStatus;
  createdAt?: string;
  updatedAt?: string;
}
