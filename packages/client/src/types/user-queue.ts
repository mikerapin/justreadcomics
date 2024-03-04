import { IUserQueueReviewData } from '@justreadcomics/common/dist/types/queue';
import { IClientSeriesService } from './series';

export interface IClientUserQueueReviewData extends Omit<IUserQueueReviewData, 'services'> {
  _id: string;
  services?: IClientSeriesService[];
}
