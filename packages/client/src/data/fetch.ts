import { USER_TOKEN_LOCAL_STORAGE_ID } from '../static/const';

export const authFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const token = window.localStorage.getItem(USER_TOKEN_LOCAL_STORAGE_ID);
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers
    }
  });
  if (response.status === 401 && token) {
    window.localStorage.removeItem(USER_TOKEN_LOCAL_STORAGE_ID);
    window.location.replace('/a/login?expired=1');
  }
  return response;
};
