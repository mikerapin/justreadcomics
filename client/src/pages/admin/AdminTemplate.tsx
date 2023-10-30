import { Await, Navigate, Outlet, useLoaderData } from 'react-router-dom';
import Footer from '../../components/Footer';
import React, { Suspense } from 'react';
import { AdminHeader } from './AdminHeader';
import { Helmet } from 'react-helmet';
import { AuthProvider } from '../../providers/AuthProvider';

export const AdminTemplate = () => {
  const authPromise = useLoaderData() as boolean;
  return (
    <>
      <Helmet>
        <title>just read comics | admin</title>
      </Helmet>
      <Suspense
        fallback={
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        }
      >
        <Await
          resolve={authPromise}
          children={(user) => {
            if (!user) {
              return <Navigate to={'/a/login'} />;
            }
            return (
              <AuthProvider userToken={user}>
                <AdminHeader />
                <div id="content">
                  <Outlet />
                </div>
                <Footer />
              </AuthProvider>
            );
          }}
        ></Await>
      </Suspense>
    </>
  );
};
