import { API_BASE_URL } from '../static/const';
import { authFetch } from './fetch';
import { IHydratedClientQueue } from '../types/queue';

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
