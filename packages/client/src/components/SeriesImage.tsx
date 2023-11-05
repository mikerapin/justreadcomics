import { ISeries } from '../types/series';
import { getSeriesImage } from '../util/image';
import { useRef } from 'react';

interface ISeriesImage {
  series: ISeries;
  alt: string;
  style?: Record<string, string | number>;
  className?: string;
}

export const SeriesImage = ({ series, style, alt, className }: ISeriesImage) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const onError = (e: any) => {
    if (imgRef.current) {
      imgRef.current.src = getSeriesImage();
    }
  };
  return <img ref={imgRef} src={getSeriesImage(series)} alt={alt} className={`img-fluid${className ? ' ' + className : ''}`} style={style} onError={onError} />;
};
