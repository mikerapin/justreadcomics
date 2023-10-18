import React from 'react';

import PageTemplate from '../pages/PageTemplate';
import ErrorPage from '../pages/ErrorPage';
import Home from '../pages/Home';
import { SeriesDetail } from '../pages/SeriesDetail';
import { AdminTemplate } from '../pages/admin/AdminTemplate';
import { AdminHome } from '../pages/admin/AdminHome';
import { AdminSeries } from '../pages/admin/AdminSeries';
import { AdminSeriesEdit } from '../pages/admin/AdminSeriesEdit';
import { AdminService } from '../pages/admin/AdminService';
import { AdminServiceEdit } from '../pages/admin/AdminServiceEdit';

export const siteRouter = [
  {
    path: '/',
    element: <PageTemplate />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/series/:id',
        element: <SeriesDetail />
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminTemplate />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/admin',
        element: <AdminHome />
      },
      {
        path: '/admin/series',
        element: <AdminSeries />
      },
      {
        path: '/admin/series/:id',
        element: <AdminSeriesEdit />
      },
      {
        path: '/admin/services',
        element: <AdminService />
      },
      {
        path: '/admin/service/:id',
        element: <AdminServiceEdit />
      }
    ]
  }
];
