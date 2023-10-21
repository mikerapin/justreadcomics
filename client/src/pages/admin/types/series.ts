import { Creator, ISeriesServices } from '../../../types/series';

export interface ISeriesForm {
  seriesName?: string;
  description?: string;
  services?: string[];
  credits?: Creator[];
  imageBlob?: File[];
}
