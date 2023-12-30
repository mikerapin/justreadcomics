import {seriesScanners} from '../static/const';
import {authFetch} from './fetch';
import {IClientSeries} from '../types/series';

export interface IScannerResult {
  msg: string;
  series: IClientSeries;
}

export const triggerScanner = async (seriesServiceId: string, seriesId: string, cleanedTitle?: boolean): Promise<IScannerResult> => {
  const scannerUrl = seriesScanners.find((s) => s.seriesServiceId === seriesServiceId)?.action;
  try {
    if (scannerUrl) {
      const res = await authFetch(`${scannerUrl}${seriesId}${cleanedTitle ? '?cleanedTitle=1' : ''}`);
      if (res.status !== 200) {
        return Promise.reject(`Error fetching data from url for service: ${seriesServiceId}`
    );
          }
          return res.json();
        }
        return Promise.reject(
      `error finding scanner url for service: ${seriesServiceId}`
    );
      } catch (e: any) {
        return Promise.reject(e);
      }
    };
