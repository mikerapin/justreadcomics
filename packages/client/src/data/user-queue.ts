import { IClientUserQueueReviewData } from '../types/queue';
import { authFetch } from './fetch';
import { API_BASE_URL } from '../static/const';

interface SubmitQueueUserReviewResult {
  msg: string;
  error: boolean;
}

export const userSubmitQueueReview = async (
  queueReviewData: Partial<IClientUserQueueReviewData>
): Promise<SubmitQueueUserReviewResult> => {
  const res = await authFetch(`${API_BASE_URL}/user-queue/submit`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(queueReviewData)
  });
  return res.json();
};
