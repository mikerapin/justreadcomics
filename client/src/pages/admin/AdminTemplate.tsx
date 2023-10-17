import { Outlet } from 'react-router-dom';
import Footer from '../../components/Footer';
import React from 'react';
import { AdminHeader } from './AdminHeader';

export const AdminTemplate = () => {
  return (
    <>
      <AdminHeader />
      <div id="content">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};
