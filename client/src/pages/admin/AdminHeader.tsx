import React from 'react';
import Logo from '../../components/Logo';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getRoutePath } from '../../util/getRoutePath';

export const AdminHeader = () => {
  const location = useLocation();
  const params = useParams();
  const path = getRoutePath(location, params);

  return (
    <header className="p-3 mb-3 border-bottom">
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
          <a href="/" className="d-flex align-items-center mb-2 mb-lg-0 link-body-emphasis text-decoration-none">
            <Logo admin />
          </a>

          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
            <li>
              <Link to="/admin" className={`nav-link px-2 ${path === '/admin' ? 'link-secondary' : 'link-body-emphasis'}`}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/series" className={`nav-link px-2 ${path === '/admin/series' ? 'link-secondary' : 'link-body-emphasis'}`}>
                Series
              </Link>
            </li>
            <li>
              <Link to="/admin/services" className={`nav-link px-2 ${path === '/admin/services' ? 'link-secondary' : 'link-body-emphasis'}`}>
                Services
              </Link>
            </li>
            {/*<li><a href="#" className="nav-link px-2 link-body-emphasis">Products</a></li>*/}
          </ul>

          <form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search">
            <input type="search" className="form-control" placeholder="Search..." aria-label="Search" />
          </form>
        </div>
      </div>
    </header>
  );
};
