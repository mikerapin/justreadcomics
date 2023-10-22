import { API_BASE_URL } from '../static/const';
import { IGetAllSeriesWithCursor, IGetThreeRandomSeries, IHydratedSeries, ISeries, ISeriesWithImageUpload } from '../types/series';

export const fetchAllSeries = async (cursor = 0): Promise<IGetAllSeriesWithCursor> => {
  const res = await fetch(`${API_BASE_URL}/series/get/all?cursor=${cursor}`);
  return await res.json();
};

export const fetchSeriesByName = async (seriesName: string): Promise<ISeries[]> => {
  const res = await fetch(`${API_BASE_URL}/series/get-name/${seriesName}`);
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

  const res = await fetch(`${API_BASE_URL}/series/update-image/${series.series._id}`, {
    method: 'PATCH',
    body: formData
  });
  return res.json();

  // delete the imageBlob from the object here?
  // delete service.imageBlob;
};

export const updateSeriesById = async (series: Partial<ISeriesWithImageUpload>): Promise<IHydratedSeries> => {
  const res = await fetch(`${API_BASE_URL}/series/update/${series._id}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: JSON.stringify(series)
  });
  if (series.imageBlob) {
    const updatedSeries: IHydratedSeries = await res.json();
    return uploadSeriesImage(updatedSeries, series.imageBlob);
  }
  return res.json();
};

export const createSeries = async (series: Partial<ISeriesWithImageUpload>) => {
  const res = await fetch(`${API_BASE_URL}/series/create`, {
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
