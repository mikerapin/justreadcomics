import React, { useEffect, useState } from 'react';
import { IHydratedSeries } from '../types/series';
import { fetchRandomThreeSeries } from '../data/series';
import { ResultCard } from '../components/ResultCard';
import { Helmet } from 'react-helmet-async';
import { PlaceholderResultCard } from '../components/placeholders/PlaceholderResultCard';
import { Col, Container, Row } from 'react-bootstrap';

const Home = () => {
  const [randomSeries, setRandomSeries] = useState<IHydratedSeries[]>();
  useEffect(() => {
    fetchRandomThreeSeries().then((res) => {
      setRandomSeries(res.data);
    });
  }, []);

  const getRandomSeriesCards = () => {
    if (!randomSeries) {
      return (
        <>
          <PlaceholderResultCard />
          <PlaceholderResultCard />
          <PlaceholderResultCard />
        </>
      );
    }
    return randomSeries?.map((hydratedSeries) => <ResultCard key={hydratedSeries.series._id} hydratedSeries={hydratedSeries} />);
  };

  return (
    <main>
      <Helmet>
        <title>just read comics</title>
      </Helmet>
      <Container className="py-5 text-center">
        <Row className="py-lg-5">
          <Col className="col-lg-6 col-md-8 mx-auto">
            <h1 className="fw-light">just read comics</h1>
            <p className="lead text-body-secondary">Find the comics you want to read with the services you love.</p>
          </Col>
        </Row>
      </Container>

      <div className="album py-5 bg-body-tertiary">
        <Container>
          <Row className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">{getRandomSeriesCards()}</Row>
        </Container>
      </div>
    </main>
  );
};
export default Home;
