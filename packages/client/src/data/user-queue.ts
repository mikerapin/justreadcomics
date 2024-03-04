import { authFetch } from './fetch';
import { API_BASE_URL } from '../static/const';
import { IClientUserQueueReviewData } from '../types/user-queue';

interface SubmitQueueUserReviewResult {
  msg: string;
  error: boolean;
}

interface FetchUserQueueResult {
  msg: string;
  error: boolean;
  data: IClientUserQueueReviewData;
}

export const fetchUserQueue = async (seriesId: string, queueId?: string | null): Promise<FetchUserQueueResult> => {
  const res = await authFetch(
    `${API_BASE_URL}/user-queue/client-fetch/${seriesId}${queueId ? `?qid=${queueId}` : ''}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET'
    }
  );
  return res.json();
};

export const userSubmitQueueReview = async (
  queueReviewData: Partial<IClientUserQueueReviewData>,
  queueId?: string
): Promise<SubmitQueueUserReviewResult> => {
  const res = await authFetch(`${API_BASE_URL}/user-queue/submit${queueId ? `?qid=${queueId}` : ''}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(queueReviewData)
  });
  return res.json();
};
