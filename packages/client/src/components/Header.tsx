import React from 'react';
import Logo from './Logo';
import { Search } from './Search';

function Header() {
  return (
    <header className="p-3 mb-3 border-bottom">
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
          <a href="/" className="d-flex align-items-center mb-2 mb-lg-0 link-body-emphasis text-decoration-none">
            <Logo />
          </a>

          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
            {/*<li><a href="#" className="nav-link px-2 link-secondary">Overview</a></li>*/}
            {/*<li><a href="#" className="nav-link px-2 link-body-emphasis">Inventory</a></li>*/}
            {/*<li><a href="#" className="nav-link px-2 link-body-emphasis">Customers</a></li>*/}
            {/*<li><a href="#" className="nav-link px-2 link-body-emphasis">Products</a></li>*/}
          </ul>

          <Search />
        </div>
      </div>
    </header>
  );
}

export default Header;
