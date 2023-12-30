import { API_BASE_URL } from '../static/const';
import { authFetch } from './fetch';
import {IClientQueue, IHydratedClientQueue} from '../types/queue';
import { IQueueReviewData } from '@justreadcomics/common/dist/types/queue';
import {IClientSeries} from "../types/series";

interface IFetchQueueEntries {
  data: IHydratedClientQueue[];
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
interface IFetchQueueEntry {
  data: IHydratedClientQueue;
}

interface SubmitQueueReviewResult {
  queue: IHydratedClientQueue,
  msg: string,
  error: boolean;
}

export const fetchQueueEntries = async (type?: 'auto' | 'user'): Promise<IFetchQueueEntries> => {
  const res = await authFetch(`${API_BASE_URL}/queue/get/all${type ? `?type=${type}` : ''}`);
  return await res.json();
};

export const fetchSingleQueueEntry = async (id: string): Promise<IFetchQueueEntry> => {
  const res = await authFetch(`${API_BASE_URL}/queue/get/${id}`);
  return await res.json();
};

export const submitQueueReview = async (id: string, queueReviewData: IQueueReviewData): Promise<SubmitQueueReviewResult> => {
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

export const rejectQueueReview = async (id: string): Promise<SubmitQueueReviewResult> => {
  const res = await authFetch(`${API_BASE_URL}/queue/review/${id}/reject`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
  });
  return res.json();
}
