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

          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0 ">
            <li className="btn-group">
              <Link to="/admin" className={`btn ${path === '/admin' ? 'btn-danger' : 'btn-secondary'}`}>
                Dashboard
              </Link>
            </li>
            <li className={'btn-group'}>
              <Link to="/admin/series" className={`btn ${path.match('/admin/series') ? 'btn-danger' : 'btn-secondary'}`}>
                Series
              </Link>
              <button type="button" className="btn btn-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                <span className="visually-hidden">Toggle Dropdown</span>
              </button>

              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="/admin/series/add">
                    Add
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/admin/services" className={`btn ${path.match('/admin/service') ? 'btn-danger' : 'btn-secondary'}`}>
                Services
              </Link>
            </li>
            {/*<li><a href="#" className="nav-link px-2 link-body-emphasis">Products</a></li>*/}
          </ul>

          <button type="button" className="btn btn-toolbar" onClick={logout}>
            Logout
          </button>

          <form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search">
            <input type="search" className="form-control" placeholder="Search..." aria-label="Search" />
          </form>
        </div>
      </div>
    </header>
  );
};
