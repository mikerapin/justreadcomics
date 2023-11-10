import React from 'react';
import Logo from '../../components/Logo';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getRoutePath } from '../../util/getRoutePath';
import { useAuth } from '../../providers/AuthProvider';

export const AdminHeader = () => {
  const location = useLocation();
  const params = useParams();
  const path = getRoutePath(location, params);
  const { logout } = useAuth();

  return (
    <header className="p-3 mb-3 border-bottom">
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
          <a href="/" className="d-flex align-items-center mb-2 mb-lg-0 link-body-emphasis text-decoration-none">
            <Logo admin />
          </a>

          <div className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0 btn-group ">
            <Link to="/admin" className={`btn ${path === '/admin' ? 'btn-danger' : 'btn-secondary'}`}>
              Dashboard
            </Link>
            <Link to="/admin/series" className={`btn ${path.match('/admin/series') ? 'btn-danger' : 'btn-secondary'}`}>
              Series
            </Link>
            <Link to="/admin/services" className={`btn ${path.match('/admin/service') ? 'btn-danger' : 'btn-secondary'}`}>
              Services
            </Link>
          </div>

          <button type="button" className="btn btn-toolbar" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
