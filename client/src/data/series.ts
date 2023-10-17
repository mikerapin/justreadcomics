import { API_BASE_URL } from '../static/const';
import { IGetAllSeriesWithCursor } from '../types/series';

export const fetchAllSeries = async (cursor = 0): Promise<IGetAllSeriesWithCursor> => {
  const res = await fetch(`${API_BASE_URL}/series/get/all?cursor=${cursor}`);
  return await res.json();
};

export const fetchSeriesByName = async (seriesName: string) => {
  const res = await fetch(`${API_BASE_URL}/series/name/${seriesName}`);
  return await res.json();
};

export const fetchSeriesById = async (seriesId: string) => {
  const res = await fetch(`${API_BASE_URL}/series/get/${seriesId}`);
  return await res.json();
};
