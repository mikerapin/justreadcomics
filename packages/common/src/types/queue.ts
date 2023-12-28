import { Types } from 'mongoose';

export interface IQueue {
  _id?: Types.ObjectId;
  seriesId: string;
  searchValue: string;
  seriesName?: string;
  imageUrl?: string;
  seriesPageUrl?: string;
  withinCU?: boolean;
  seriesCreators?: string[];
  seriesDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}
