import { useEffect, useState } from 'react';
import { fetchSeriesById } from '../data/series';
import { useParams } from 'react-router-dom';
import { ISeries } from '../types/series';
import { Services } from '../components/Services';
import { IServices } from '../types/service';

export const SeriesDetail = () => {
  let { id } = useParams();
  const [series, setSeries] = useState<ISeries>();
  const [services, setServices] = useState<IServices[]>();
  useEffect(() => {
    if (id) {
      fetchSeriesById(id).then((result) => {
        setSeries(result.series);
        setServices(result.services);
      });
    }
  }, [id]);
  return (
    <div className="container">
      <div className="row">
        <div className="col-4">
          <img className="img-fluid" src="https://cdn.imagecomics.com/assets/i/releases/1004971/transformers-1_93d4f9fa47.jpg" alt="transformers" />
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
