import React from 'react';

import PageTemplate from '../pages/PageTemplate';
import ErrorPage from '../pages/ErrorPage';
import Home from '../pages/Home';
import { SeriesDetail } from '../pages/SeriesDetail';
import { AdminTemplate } from '../admin/AdminTemplate';
import { AdminHome } from '../admin/AdminHome';
import { AdminSeries } from '../admin/AdminSeries';
import { AdminSeriesEdit } from '../admin/AdminSeriesEdit';
import { AdminService } from '../admin/AdminService';
import { AdminServiceEdit } from '../admin/AdminServiceEdit';
import { AdminLogin } from '../admin/AdminLogin';
import { SearchPage } from '../pages/SearchPage';
import { authenticate } from '../data/auth';
import { QueueList } from '../admin/QueueList.';

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
      },
      {
        path: '/search',
        element: <SearchPage />
      }
    ]
  },
  {
    path: '/a/login',
    element: <AdminLogin />,
    errorElement: <ErrorPage />
  },
  {
    path: '/admin',
    element: <AdminTemplate />,
    errorElement: <ErrorPage />,
    loader: async () => {
      return await authenticate();
    },
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
        path: '/admin/series/new',
        element: <AdminSeriesEdit />
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
        path: '/admin/service/new',
        element: <AdminServiceEdit />
      },
      {
        path: '/admin/service/:id',
        element: <AdminServiceEdit />
      },
      {
        path: '/admin/queue',
        element: <QueueList />
      }
    ]
  }
];
