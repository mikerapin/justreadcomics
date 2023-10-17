import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import ErrorPage from './pages/ErrorPage';
import PageTemplate from './pages/PageTemplate';
import { SeriesDetail } from './pages/SeriesDetail';
import { AdminTemplate } from './pages/admin/AdminTemplate';
import { AdminHome } from './pages/admin/AdminHome';
import { AdminSeries } from './pages/admin/AdminSeries';
import { AdminService } from './pages/admin/AdminService';

// @ts-ignore
const router = createBrowserRouter([
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
        path: '/admin/services',
        element: <AdminService />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
