import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

export const ComingSoon = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="py-lg-5">
        <Col className="col-lg-6 col-md-8 mx-auto">
          <h1 className="fw-light">just read comics</h1>
          <p className="lead text-body-secondary">coming soon</p>
        </Col>
      </Row>
    </Container>
  );
};
