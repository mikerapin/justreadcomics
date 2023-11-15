import { seriesScanners } from '../static/const';
import { authFetch } from './fetch';
import { ISeries } from '../types/series';

interface IScannerResult {
  msg: string;
  series: ISeries;
}

export const triggerScanner = async (seriesServiceId: string, seriesId: string): Promise<IScannerResult> => {
  const scannerUrl = seriesScanners.find((s) => s.seriesServiceId === seriesServiceId)?.action;
  if (scannerUrl) {
    const res = await authFetch(`${scannerUrl}${seriesId}`);
    return res.json();
  }
  return Promise.reject();
};
