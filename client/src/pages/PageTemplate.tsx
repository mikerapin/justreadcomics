import { Outlet } from "react-router-dom";
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PageTemplate() {
  return (
    <>
      <Header/>
      <div id="content">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}