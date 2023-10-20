import { useEffect, useState } from 'react';
import { fetchSeriesById } from '../data/series';
import { useParams } from 'react-router-dom';
import { ISeries } from '../types/series';
import { Services } from '../components/Services';
import { IService } from '../types/service';
import { getCoverImage } from '../util/image';
import { LoadingSeries } from './LoadingSeries';

export const SeriesDetail = () => {
  let { id } = useParams();
  const [series, setSeries] = useState<ISeries>();
  const [services, setServices] = useState<IService[]>();
  useEffect(() => {
    if (id) {
      fetchSeriesById(id).then((result) => {
        setSeries(result.series);
        setServices(result.services);
      });
    }
  }, [id]);

  if (!series) {
    return <LoadingSeries />;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-4">
          <img className="img-fluid" src={getCoverImage(series)} alt={series?.seriesName} />
        </div>
        <div className="col-8">
          <div className="text-content">
            <h1 className="title">{series?.seriesName}</h1>
            <p>{series?.description}</p>
          </div>
          <Services services={services} />
        </div>
      </div>
    </div>
  );
};
