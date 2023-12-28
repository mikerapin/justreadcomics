import { Creator } from '@justreadcomics/common/dist/types/series';

export interface ISeriesForm {
  seriesName?: string;
  description?: string;
  services?: string[];
  primary?: number;
  credits?: Creator[];
  imageBlob?: File[];
}
