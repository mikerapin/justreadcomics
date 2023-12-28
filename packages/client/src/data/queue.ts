import { API_BASE_URL } from '../static/const';
import { authFetch } from './fetch';
import { IHydratedClientQueue } from '../types/queue';

interface IFetchQueueEntries {
  data: IHydratedClientQueue[];
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export const fetchQueueEntries = async (type?: 'auto' | 'user'): Promise<IFetchQueueEntries> => {
  const res = await authFetch(`${API_BASE_URL}/queue/get/all${type ? `?type=${type}` : ''}`);
  return await res.json();
};
