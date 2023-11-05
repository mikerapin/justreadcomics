import React, { useEffect, useState } from 'react';
import { IHydratedSeries } from '../types/series';
import { fetchRandomThreeSeries } from '../data/series';
import { ResultCard } from '../components/ResultCard';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const [randomSeries, setRandomSeries] = useState<IHydratedSeries[]>();
  useEffect(() => {
    fetchRandomThreeSeries().then((res) => {
      setRandomSeries(res.data);
    });
  }, []);
  return (
    <main>
      <Helmet>
        <title>just read comics</title>
      </Helmet>
      <section className="py-5 text-center container">
        <div className="row py-lg-5">
          <div className="col-lg-6 col-md-8 mx-auto">
            <h1 className="fw-light">just read comics</h1>
            <p className="lead text-body-secondary">Find the comics you want to read with the services you love.</p>
          </div>
        </div>
      </section>

      <div className="album py-5 bg-body-tertiary">
        <div className="container">
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
            {randomSeries?.map((hydratedSeries) => (
              <ResultCard key={hydratedSeries.series._id} hydratedSeries={hydratedSeries} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
export default Home;
