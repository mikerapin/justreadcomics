import { IHydratedSeries } from '../types/series';
import React from 'react';
import { Link } from 'react-router-dom';
import { SeriesImage } from './SeriesImage';
import { getServiceImage } from '../util/image';

export const ResultCard = ({ hydratedSeries }: { hydratedSeries: IHydratedSeries }) => {
  const { series, services } = hydratedSeries;
  return (
    <div className="col">
      <div className="card shadow-sm">
        <div className="d-flex align-items-center" style={{ minHeight: 420, maxHeight: 420, overflow: 'hidden' }}>
          <SeriesImage series={series} alt={series.seriesName} className="bd-placeholder-img card-img-top" />
        </div>
        <div className="card-body">
          <p className="card-text" style={{ minHeight: '48px' }}>
            {series.seriesName}
          </p>
          <div className="d-flex justify-content-between align-items-center">
            <div className="btn-group">
              <Link to={`/series/${series._id}`} type="button" className="btn btn-sm btn-outline-secondary">
                View
              </Link>
            </div>
            {services?.map((service) => {
              return (
                <img
                  key={service._id}
                  style={{ maxHeight: '30px' }}
                  className="img-thumbnail rounded-2 bg-white"
                  src={getServiceImage(service)}
                  alt={service.serviceName}
                  title={service.serviceName}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
