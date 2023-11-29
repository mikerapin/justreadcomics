import { getSeriesImage } from '../util/image';
import { Helmet } from 'react-helmet-async';
import React from 'react';
import { Col, Container, Placeholder, Row } from 'react-bootstrap';

export const LoadingSeries = () => {
  return (
    <Container>
      <Helmet>
        <title>Loading | just read comics</title>
      </Helmet>
      <Row>
        <Col md={4}>
          <img className="img-fluid" src={getSeriesImage()} alt="Loading" />
        </Col>
        <Col md={8}>
          <div className="text-content">
            <Placeholder animation="glow">
              <Placeholder xs={8} size="sm" style={{ height: '48px' }} />
            </Placeholder>
            <Placeholder animation="glow" style={{ marginTop: '10px' }}>
              <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} /> <Placeholder xs={6} /> <Placeholder xs={8} /> <Placeholder xs={4} />{' '}
              <Placeholder xs={6} /> <Placeholder xs={2} /> <Placeholder xs={5} /> <Placeholder xs={2} />
            </Placeholder>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
