import { authFetch } from './fetch';
import { API_BASE_URL, USER_TOKEN_LOCAL_STORAGE_ID } from '../static/const';

export const authenticate = async () => {
  const res = await authFetch(new URL(`${API_BASE_URL}/auth/me`));

  if (res.status === 200) {
    return window.localStorage.getItem(USER_TOKEN_LOCAL_STORAGE_ID);
  } else {
    return null;
  }
};

export const loginFetch = async (loginForm: { username: string; password: string }) => {
  const fetchUrl = new URL(`${API_BASE_URL}/auth/login`);
  try {
    const res = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginForm)
    });

    const data = await res.json();

    if (res.status !== 200) {
      return false;
    }
    window.localStorage.setItem(USER_TOKEN_LOCAL_STORAGE_ID, data.token);
    return true;
  } catch (e: any) {
    return false;
  }
};
