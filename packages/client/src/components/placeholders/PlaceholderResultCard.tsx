import React from 'react';
import { Card, Col, Placeholder } from 'react-bootstrap';

export const PlaceholderResultCard = () => {
  return (
    <Col>
      <Card className="shadow-sm">
        <Placeholder animation="glow">
          <Placeholder className="w-100" style={{ height: '420px' }} />
        </Placeholder>
        <Card.Body>
          <Placeholder as={Card.Title} animation="glow" style={{ height: '48px' }}>
            <Placeholder sm={8} />
          </Placeholder>
          <Placeholder.Button variant="outline-secondary" xs={3} animation="glow" />
        </Card.Body>
      </Card>
    </Col>
  );
};
