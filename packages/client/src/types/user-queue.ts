import { IUserQueueReviewData, QueueFilterStatus } from '@justreadcomics/common/dist/types/queue';
import { IClientSeries, IClientSeriesService } from './series';
import { Creator, ISeriesService } from '@justreadcomics/common/dist/types/series';
import { IClientService } from './service';

export interface IClientUserQueueReviewData extends Omit<IUserQueueReviewData, 'services'> {
  _id: string;
  services?: IClientSeriesService[];
}

export interface IClientUserSubmissionListData {
  _id: string;
  createdAt?: string;
  updatedAt?: string;

  seriesId: string;
  seriesDescription: string;
  seriesName: string;
  userId: string;
  credits: Creator[];
  series: IClientSeries;
  services: ISeriesService[];
  newServices: IClientService[];
  currentServices: IClientService[];

  reviewedDate?: string;
  reviewStatus?: QueueFilterStatus;
}
