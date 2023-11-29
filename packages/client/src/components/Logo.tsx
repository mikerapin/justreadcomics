import React from 'react';
import logo from './logo.svg';
import './Logo.scss';
import { Stack } from 'react-bootstrap';

function Logo({ admin = false }: { admin?: boolean }) {
  return (
    <Stack direction="horizontal" gap={2} className="align-items-center justify-content-center">
      <img className={`logo${admin ? ' bg-danger rounded' : ''}`} src={logo} alt="just read comics" />
      <h2>just read comics</h2>
    </Stack>
  );
}

export default Logo;
