import { getBaseUrl, getScraperBaseUrl } from '../util/http';
import { CORPO_SERVICE_ID, IMAGE_SERVICE_ID, SHONEN_JUMP_SERVICE_ID } from '@justreadcomics/common/dist/const';

export const API_BASE_URL = `${getBaseUrl()}/api`;
export const SCRAPER_BASE_URL = `${getScraperBaseUrl()}/scraper`;

export const DEFAULT_COVER_IMAGE = '/img/default-cover.png';
export const DEFAULT_SERVICE_IMAGE = '/img/services/default-service.png';

export const USER_TOKEN_LOCAL_STORAGE_ID = 'token';

export const seriesScanners = [
  // corpo scanner
  {
    seriesServiceId: CORPO_SERVICE_ID,
    action: `${SCRAPER_BASE_URL}/corpo/`
  },
  // image scanner
  {
    seriesServiceId: IMAGE_SERVICE_ID,
    action: `${SCRAPER_BASE_URL}/image/`
  },
  // shonen jump scanner
  {
    seriesServiceId: SHONEN_JUMP_SERVICE_ID,
    action: `${SCRAPER_BASE_URL}/shonen-jump/`
  }
];
