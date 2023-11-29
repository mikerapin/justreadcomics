import React from 'react';
import Logo from '../../components/Logo';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getRoutePath } from '../../util/getRoutePath';
import { useAuth } from '../../providers/AuthProvider';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';

export const AdminHeader = () => {
  const location = useLocation();
  const params = useParams();
  const path = getRoutePath(location, params);
  const { logout } = useAuth();

  return (
    <div className="p-3 mb-3 border-bottom">
      <Navbar expand="lg">
        <Container>
          <Navbar.Brand href="/admin">
            <Logo admin />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link to="/admin" className={`m-2 btn ${path === '/admin' ? 'btn-danger' : 'btn-secondary'}`}>
                Dashboard
              </Link>
              <Link to="/admin/series" className={`m-2 btn ${path.match('/admin/series') ? 'btn-danger' : 'btn-secondary'}`}>
                Series
              </Link>
              <Link to="/admin/services" className={`m-2 btn ${path.match('/admin/service') ? 'btn-danger' : 'btn-secondary'}`}>
                Services
              </Link>
            </Nav>

            <Nav>
              <Button variant="link" type="button" className="btn btn-toolbar" onClick={logout}>
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};
