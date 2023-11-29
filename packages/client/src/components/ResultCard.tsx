import { IHydratedSeries } from '../types/series';
import React from 'react';
import { Link } from 'react-router-dom';
import { SeriesImage } from './SeriesImage';
import { ButtonGroup, Card, CardText, Col, Stack } from 'react-bootstrap';
import { ServiceImage } from './ServiceImage';

export const ResultCard = ({ hydratedSeries }: { hydratedSeries: IHydratedSeries }) => {
  const { series, services } = hydratedSeries;
  return (
    <Col>
      <Card className="shadow-sm">
        <div className="d-flex align-items-center" style={{ minHeight: 420, maxHeight: 420, overflow: 'hidden' }}>
          <SeriesImage series={series} alt={series.seriesName} className="bd-placeholder-img card-img-top" />
        </div>
        <Card.Body>
          <CardText style={{ minHeight: '48px' }}>{series.seriesName}</CardText>

          <Stack direction="horizontal" gap={2}>
            <ButtonGroup>
              <Link to={`/series/${series._id}`} type="button" className="btn btn-sm btn-outline-secondary">
                View
              </Link>
            </ButtonGroup>

            <div className="ms-auto">
              {services?.map((service) => {
                return <ServiceImage service={service} size="xs" />;
              })}
            </div>
          </Stack>
        </Card.Body>
      </Card>
    </Col>
  );
};
