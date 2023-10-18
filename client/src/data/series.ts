import { API_BASE_URL } from '../static/const';
import { IGetAllSeriesWithCursor, IHydratedSeries, ISeries } from '../types/series';

export const fetchAllSeries = async (cursor = 0): Promise<IGetAllSeriesWithCursor> => {
  const res = await fetch(`${API_BASE_URL}/series/get/all?cursor=${cursor}`);
  return await res.json();
};

export const fetchSeriesByName = async (seriesName: string) => {
  const res = await fetch(`${API_BASE_URL}/series/name/${seriesName}`);
  return await res.json();
};

export const fetchSeriesById = async (seriesId: string): Promise<IHydratedSeries> => {
  const res = await fetch(`${API_BASE_URL}/series/get/${seriesId}`);
  return await res.json();
};

export const updateSeriesById = async (series: Partial<ISeries>) => {
  const res = await fetch(`${API_BASE_URL}/series/update/${series._id}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: JSON.stringify(series)
  });
  return res.json();
};

export const createSeries = async (series: Partial<ISeries>) => {
  const res = await fetch(`${API_BASE_URL}/series/create`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(series)
  });
  return res.json();
};
