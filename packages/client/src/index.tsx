import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/custom.scss';
import '@popperjs/core/dist/esm/popper';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { siteRouter } from './router/routes';
import { HelmetProvider } from 'react-helmet-async';

// @ts-ignore
const router = createBrowserRouter(siteRouter);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
);
