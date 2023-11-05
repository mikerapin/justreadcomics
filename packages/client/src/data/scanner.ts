import { seriesScanners } from '../static/const';
import { authFetch } from './fetch';

export const triggerScanner = async (seriesServiceId: string, seriesId: string) => {
  const scannerUrl = seriesScanners.find((s) => s.seriesServiceId === seriesServiceId)?.action;
  if (scannerUrl) {
    const res = await authFetch(`${scannerUrl}${seriesId}`);
    return res.json();
  }
  return Promise.reject();
};
