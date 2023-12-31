import React, { useEffect, useState } from 'react';
import { fetchSeriesById } from '../data/series';
import { Link, useParams } from 'react-router-dom';
import { ISeries } from '../types/series';
import { Services } from '../components/Services';
import { IService } from '../types/service';
import { LoadingSeries } from './LoadingSeries';
import { SeriesImage } from '../components/SeriesImage';
import { Helmet } from 'react-helmet-async';
import { useAdmin } from '../hooks/admin';

export const SeriesDetail = () => {
  const { id } = useParams();
  const isAdmin = useAdmin();
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
      <Helmet>
        <title>Where to read {series.seriesName} | just read comics</title>
      </Helmet>
      <div className="row">
        <div className="col-4">
          <SeriesImage series={series} alt={series.seriesName} />
        </div>
        <div className="col-8">
          <div className="text-content">
            {isAdmin ? <Link to={`/admin/series/${series?._id}`}>Edit</Link> : ''}
            <h1 className="title">{series?.seriesName}</h1>

            <p>{series?.description}</p>
          </div>
          <Services services={services} seriesServices={series.services} />
        </div>
      </div>
    </div>
  );
};
