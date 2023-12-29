import { API_BASE_URL } from '../static/const';
import { authFetch } from './fetch';
import { IHydratedClientQueue } from '../types/queue';
import { IQueueReviewData } from '@justreadcomics/common/dist/types/queue';

interface IFetchQueueEntries {
  data: IHydratedClientQueue[];
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
interface IFetchQueueEntry {
  data: IHydratedClientQueue;
}

export const fetchQueueEntries = async (type?: 'auto' | 'user'): Promise<IFetchQueueEntries> => {
  const res = await authFetch(`${API_BASE_URL}/queue/get/all${type ? `?type=${type}` : ''}`);
  return await res.json();
};

export const fetchSingleQueueEntry = async (id: string): Promise<IFetchQueueEntry> => {
  const res = await authFetch(`${API_BASE_URL}/queue/get/${id}`);
  return await res.json();
};

export const submitQueueReview = async (id: string, queueReviewData: IQueueReviewData) => {
  const res = await authFetch(`${API_BASE_URL}/queue/review/${id}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(queueReviewData)
  });
  return res.json();
};
