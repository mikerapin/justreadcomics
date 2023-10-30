import { USER_TOKEN_LOCAL_STORAGE_ID } from '../static/const';

export const authFetch = (url: RequestInfo | URL, options?: RequestInit) => {
  const token = window.localStorage.getItem(USER_TOKEN_LOCAL_STORAGE_ID);
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers
    }
  });
};
