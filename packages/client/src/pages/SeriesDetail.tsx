import React, { useEffect, useState } from 'react';
import { fetchSeriesById } from '../data/series';
import { Link, useParams } from 'react-router-dom';
import { IClientSeries } from '../types/series';
import { Services } from '../components/Services';
import { IClientService } from '../types/service';
import { LoadingSeries } from './LoadingSeries';
import { SeriesImage } from '../components/SeriesImage';
import { Helmet } from 'react-helmet-async';
import { useAdmin } from '../hooks/admin';
import { Col, Container, Row } from 'react-bootstrap';

export const SeriesDetail = () => {
  const { id } = useParams();
  const isAdmin = useAdmin();
  const [series, setSeries] = useState<IClientSeries>();
  const [services, setServices] = useState<IClientService[]>();
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
    <Container>
      <Helmet>
        <title>Where to read {series.seriesName} | just read comics</title>
      </Helmet>
      <Row>
        <Col xs={4}>
          <SeriesImage series={series} alt={series.seriesName} />
        </Col>
        <Col xs={8}>
          <div className="text-content">
            {isAdmin ? <Link to={`/admin/series/${series?._id}`}>Edit</Link> : ''}
            <h1 className="title">{series?.seriesName}</h1>

            <p>{series?.description}</p>
          </div>
          <Services services={services} seriesServices={series.services} />
        </Col>
      </Row>
    </Container>
  );
};
