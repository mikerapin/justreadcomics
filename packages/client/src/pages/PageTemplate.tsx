import { Outlet } from 'react-router-dom';
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function PageTemplate() {
  return (
    <>
      <Helmet>
        <title>just read comics</title>
      </Helmet>
      <Header />
      <div id="content">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
