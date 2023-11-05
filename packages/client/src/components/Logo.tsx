import React from 'react';
import logo from './logo.svg';
import './Logo.scss';

function Logo({ admin = false }: { admin?: boolean }) {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <img className={`logo${admin ? ' bg-danger rounded' : ''}`} src={logo} alt="just read comics" />
      <h2>just read comics</h2>
    </div>
  );
}

export default Logo;
