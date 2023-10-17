import { API_BASE_URL } from '../static/const';

export const GET_SERIES_BY_ID = API_BASE_URL + '/series/get/:id';

const fetchSeriesById = (seriesId: string) => {
  return fetch(`${API_BASE_URL}/series/get/${seriesId}`).then((res) => {
    return res.json();
  });
};

export { fetchSeriesById };
