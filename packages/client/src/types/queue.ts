import { IQueue } from '@justreadcomics/common/dist/types/queue';
import { IClientSeries } from './series';

export interface IClientQueue extends Omit<IQueue, '_id'> {
  _id: string;
}

export interface IHydratedClientQueue extends IClientQueue {
  series: IClientSeries; 
}
