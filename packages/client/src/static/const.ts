import { getBaseUrl, getScraperBaseUrl } from '../util/http';
import {
  CORPO_SERVICE_ID,
  HOOPLA_SERVICE_ID,
  IMAGE_SERVICE_ID,
  MARVEL_UNLIMITED_SERVICE_ID,
  SHONEN_JUMP_SERVICE_ID
} from '@justreadcomics/common/dist/const';

export const API_BASE_URL = `${getBaseUrl()}/api`;
export const SCRAPER_BASE_URL = `${getScraperBaseUrl()}/scraper`;

export const DEFAULT_COVER_IMAGE = '/img/default-cover.png';
export const DEFAULT_SERVICE_IMAGE = '/img/services/default-service.png';

export const USER_TOKEN_LOCAL_STORAGE_ID = 'token';

export const seriesScanners = [
  // corpo scanner
  {
    seriesServiceId: CORPO_SERVICE_ID,
    action: `${SCRAPER_BASE_URL}/corpo/`,
    refreshAction: `${SCRAPER_BASE_URL}/refresh/corpo/`,
    refresh: true,
    metadata: true,
    availability: false
  },
  // hoopla scanner
  {
    seriesServiceId: HOOPLA_SERVICE_ID,
    action: `${SCRAPER_BASE_URL}/hoopla/`,
    refresh: false,
    metadata: false,
    availability: true
  },
  // marvel scanner
  {
    seriesServiceId: MARVEL_UNLIMITED_SERVICE_ID,
    action: `${SCRAPER_BASE_URL}/marvel/`,
    refreshAction: `${SCRAPER_BASE_URL}/refresh/marvel/`,
    refresh: true,
    metadata: false,
    availability: false
  },
  // image scanner
  {
    seriesServiceId: IMAGE_SERVICE_ID,
    action: `${SCRAPER_BASE_URL}/image/`,
    refreshAction: `${SCRAPER_BASE_URL}/refresh/image/`,
    refresh: true,
    metadata: false,
    availability: false
  },
  // shonen jump scanner
  {
    seriesServiceId: SHONEN_JUMP_SERVICE_ID,
    action: `${SCRAPER_BASE_URL}/shonen-jump/`,
    refresh: false,
    metadata: true,
    availability: false
  }
];
