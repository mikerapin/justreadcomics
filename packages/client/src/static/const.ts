import { getBaseUrl } from '../util/http';

export const API_BASE_URL = `${getBaseUrl()}/api`;
export const SCRAPER_BASE_URL = `${getBaseUrl()}/scraper`;

export const DEFAULT_COVER_IMAGE = '/img/default-cover.png';
export const DEFAULT_SERVICE_IMAGE = '/img/services/default-service.png';

export const USER_TOKEN_LOCAL_STORAGE_ID = 'token';

export const seriesScanners = [
  // corpo scanner
  {
    seriesServiceId: '652ea8fd905191bc5f8c34bd',
    action: `${SCRAPER_BASE_URL}/corpo/`
  },
  // image scanner
  {
    seriesServiceId: '653afb1e23027c9826267cb8',
    action: `${SCRAPER_BASE_URL}/image/`
  }
];
