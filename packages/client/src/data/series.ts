import { API_BASE_URL } from '../static/const';
import {
  IFetchMultipleSeriesWithCursor,
  IGetThreeRandomSeries,
  IHydratedSeries,
  ISeriesWithImageUpload
} from '../types/series';
import { authFetch } from './fetch';

export const fetchAllSeries = async (cursor = 0): Promise<IFetchMultipleSeriesWithCursor> => {
  const res = await fetch(`${API_BASE_URL}/series/get/all?cursor=${cursor}`);
  return await res.json();
};

export interface IFetchSeriesSearchOptions {
  seriesName: string;
  isLargeSearch?: boolean;
  cursor?: number;
}

export const fetchSeriesByName = async (
  options: IFetchSeriesSearchOptions
): Promise<IFetchMultipleSeriesWithCursor> => {
  const { seriesName, isLargeSearch, cursor } = options;
  const fetchUrl = new URL(`${API_BASE_URL}/series/get-name/${seriesName}`);
  if (isLargeSearch) {
    fetchUrl.searchParams.append('isLargeSearch', '1');
  }
  if (cursor && cursor > 0) {
    fetchUrl.searchParams.append('cursor', `${cursor}`);
  }
  const res = await fetch(fetchUrl);
  return await res.json();
};

export const fetchSeriesById = async (seriesId: string): Promise<IHydratedSeries> => {
  const res = await fetch(`${API_BASE_URL}/series/get/${seriesId}`);
  return await res.json();
};

export const fetchRandomThreeSeries = async (): Promise<IGetThreeRandomSeries> => {
  const res = await fetch(`${API_BASE_URL}/series/get-3`);
  return await res.json();
};

const uploadSeriesImage = async (series: IHydratedSeries, imageBlob: File) => {
  const formData = new FormData();
  const cleanedFileName = series.series.seriesName.split(' ').join('');

  const filename = `${cleanedFileName}.${imageBlob.name.split('.').pop()}`.toLowerCase();

  formData.append('imageBlob', imageBlob, filename);

  const res = await authFetch(`${API_BASE_URL}/series/update-image/${series.series._id}`, {
    method: 'PATCH',
    body: formData
  });
  return res.json();

  // delete the imageBlob from the object here?
  // delete service.imageBlob;
};

export const updateSeriesById = async (series: Partial<ISeriesWithImageUpload>): Promise<IHydratedSeries> => {
  const res = await authFetch(`${API_BASE_URL}/series/update/${series._id}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: JSON.stringify(series)
  });

  if (series.imageBlob) {
    const updatedHydratedSeries: IHydratedSeries = await res.json();
    updatedHydratedSeries.series = await uploadSeriesImage(updatedHydratedSeries, series.imageBlob);
    return updatedHydratedSeries;
  } else {
    return await res.json();
  }
};

export const updateSeriesService = async (
  seriesId: string,
  seriesServiceId: string,
  seriesServiceUrl: string
): Promise<IHydratedSeries> => {
  // /update/:id:/series-service/:serviceId
  const res = await authFetch(`${API_BASE_URL}/series/update/${seriesId}/series-service/${seriesServiceId}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: JSON.stringify({ seriesServiceUrl })
  });
  return await res.json();
};

export const createSeries = async (series: Partial<ISeriesWithImageUpload>): Promise<IHydratedSeries> => {
  const res = await authFetch(`${API_BASE_URL}/series/create`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(series)
  });
  if (series.imageBlob) {
    const updatedSeries: IHydratedSeries = await res.json();
    return uploadSeriesImage(updatedSeries, series.imageBlob);
  }
  return res.json();
};
