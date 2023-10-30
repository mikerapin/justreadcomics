export const authFetch = (url: RequestInfo | URL, options?: RequestInit) => {
  const token = window.localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers
    }
  });
};
