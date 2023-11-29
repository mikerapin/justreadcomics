import { getServiceImage } from '../util/image';
import { useRef } from 'react';
import { IService } from '../types/service';
import { DEFAULT_SERVICE_IMAGE } from '../static/const';

interface IServiceImage {
  service: IService;
  alt?: string;
  style?: Record<string, string | number>;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const ServiceImage = ({ service, style, alt, className, size }: IServiceImage) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const onError = (e: any) => {
    if (imgRef.current) {
      imgRef.current.src = DEFAULT_SERVICE_IMAGE;
    }
  };

  let imageStyle = style;
  if (size) {
    switch (size) {
      case 'xs':
        imageStyle = { width: '32px' };
        break;
      case 'sm':
        imageStyle = { width: '64px' };
        break;
      case 'md':
        imageStyle = { width: '128px' };
        break;
    }
  }

  return (
    <img
      ref={imgRef}
      src={getServiceImage(service)}
      alt={alt || service.serviceName}
      className={`rounded-1 img-fluid${className ? ' ' + className : ''}`}
      style={{ backgroundColor: '#fff', ...imageStyle }}
      onError={onError}
      title={alt || service.serviceName}
    />
  );
};
