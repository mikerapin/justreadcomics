import { Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import Header from '../components/Header';
import { Helmet } from 'react-helmet-async';
import { ComingSoon } from './ComingSoon';
import Footer from '../components/Footer';

export default function PageTemplate() {
  const location = useLocation();

  const hideSite = process.env.NODE_ENV === 'production' && !location.search.includes('cool_guy_override');

  return (
    <>
      <Helmet>
        <title>just read comics</title>
      </Helmet>
      {hideSite ? (
        <ComingSoon />
      ) : (
        <>
          <Header />
          <div id="content">
            <Outlet />
          </div>
          <Footer />
        </>
      )}
    </>
  );
}
