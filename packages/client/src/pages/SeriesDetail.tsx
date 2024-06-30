import React, { useEffect, useState } from 'react';
import { fetchSeriesById } from '../data/series';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IClientSeries } from '../types/series';
import { Services } from '../components/Services';
import { IClientService } from '../types/service';
import { LoadingSeries } from './LoadingSeries';
import { SeriesImage } from '../components/SeriesImage';
import { Helmet } from 'react-helmet-async';
import { useAdmin } from '../hooks/admin';
import { Badge, Button, Col, Container, Row, Stack } from 'react-bootstrap';
import { useSubmitter } from '../hooks/submitter';
import { fetchUserQueue } from '../data/user-queue';

export const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = useAdmin();
  const isSubmitter = useSubmitter();
  const [series, setSeries] = useState<IClientSeries>();
  const [services, setServices] = useState<IClientService[]>();
  const [queueId, setQueueId] = useState<string | null>(null);
  useEffect(() => {
    if (id) {
      fetchSeriesById(id).then((result) => {
        setSeries(result.series);
        setServices(result.services);
      });
    }
  }, [id]);
  useEffect(() => {
    if (id && isSubmitter) {
      fetchUserQueue(id).then((result) => {
        if (result && result.data) {
          setQueueId(result.data._id);
        }
      });
    }
  }, [id, isSubmitter]);

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
            <Stack direction="horizontal" className="justify-content-end">
              {isAdmin && (
                <Button type="button" onClick={() => navigate(`/admin/series/${id}`)}>
                  Admin Edit
                </Button>
              )}
              {isSubmitter && (
                <Button type="button" onClick={() => navigate(`/edit/series/${id}${queueId ? `?qid=${queueId}` : ''}`)}>
                  Edit
                </Button>
              )}
            </Stack>
            <h1 className="title">{series?.seriesName}</h1>

            <p>{series?.description}</p>
          </div>
          <Services services={services} seriesServices={series.services} />
          {series.credits?.length ? (
            <>
              <h3>Creators:</h3>
              <Stack direction="horizontal" gap={2} style={{ flexWrap: 'wrap' }}>
                {series.credits?.map((credit, index) => (
                  <Badge key={`${credit.name}-${index}`} pill bg="secondary">
                    {credit.name}
                  </Badge>
                ))}
              </Stack>
            </>
          ) : null}
        </Col>
      </Row>
    </Container>
  );
};
