import { Outlet } from 'react-router-dom';
import Footer from '../../components/Footer';
import React from 'react';
import { AdminHeader } from './AdminHeader';
import { Helmet } from 'react-helmet';

export const AdminTemplate = () => {
  return (
    <>
      <Helmet>
        <title>just read comics | admin</title>
      </Helmet>
      <AdminHeader />
      <div id="content">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};
