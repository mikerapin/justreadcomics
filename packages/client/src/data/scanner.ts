import { seriesScanners } from '../static/const';
import { authFetch } from './fetch';
import { IClientSeries } from '../types/series';

export interface IScannerResult {
  msg: string;
  series: IClientSeries;
}

export const triggerScanner = async (
  seriesServiceId: string,
  seriesId: string,
  cleanedTitle?: boolean,
  fetchMetaData?: boolean,
  refresh?: boolean
): Promise<IScannerResult> => {
  let scannerUrl = seriesScanners.find((s) => s.seriesServiceId === seriesServiceId)?.action;
  if (refresh) {
    scannerUrl = seriesScanners.find((s) => s.seriesServiceId === seriesServiceId)?.refreshAction;
  }
  try {
    if (scannerUrl) {
      const url = new URL(`${scannerUrl}${seriesId}`);
      url.searchParams.set('cleanedTitle', `${cleanedTitle}`);
      url.searchParams.set('fetchMetaData', `${fetchMetaData}`);
      const res = await authFetch(url.toString());
      if (res.status !== 200) {
        return Promise.reject(`Error fetching data from url for service: ${seriesServiceId}`);
      }
      return res.json();
    }
    return Promise.reject(`error finding scanner url for service: ${seriesServiceId}`);
  } catch (e: any) {
    return Promise.reject(e);
  }
};
