import { Creator } from '@justreadcomics/common/dist/types/series';

export interface ISeriesForm {
  seriesName?: string;
  description?: string;
  services?: string[];
  credits?: Creator[];
  imageBlob?: File[];
}
