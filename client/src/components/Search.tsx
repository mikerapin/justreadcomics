import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

import { Dropdown } from 'bootstrap';
import { ISeries } from '../types/series';
import { fetchSeriesByName } from '../data/series';
import { Link } from 'react-router-dom';

export const Search = () => {
  const dropdownElementRef = useRef<HTMLDivElement>(null);
  const dropdown = useRef<Dropdown | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [seriesResults, setSeriesResults] = useState<ISeries[]>();

  useEffect(() => {
    if (dropdownElementRef.current) {
      dropdown.current = new Dropdown(dropdownElementRef.current, { reference: 'parent' });
    }
  }, [dropdownElementRef]);

  const searchInMenu = (val: string) => {
    if (val.length < 2) {
      closeMenu();
      return;
    }
    fetchSeriesByName(val).then((res) => {
      setSeriesResults(res);
    });
    dropdown.current?.show();
  };

  const typeToSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (!dropdownElementRef.current) {
      return;
    }
    const val = e.target.value;
    searchInMenu(val);
  };

  const closeMenu = () => {
    dropdown.current?.hide();
  };

  const formSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchRef.current) {
      searchInMenu(searchRef.current.value);
    }
  };

  /* Todo: not sure if I like this, so commenting for now */
  // const arrowCheck = (e: React.KeyboardEvent) => {
  //   if (dropdownElementRef.current && e.key === 'ArrowDown') {
  //     console.log('down');
  //     dropdownElementRef.current.querySelector('a')?.focus({ preventScroll: true });
  //   }
  // };

  return (
    <form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search" onSubmit={formSubmit}>
      <div className="btn-group dropdown">
        <input
          type="search"
          className="form-control dropdown-toggle"
          data-bs-toggle="dropdown"
          data-bs-auto-close="outside"
          placeholder="Search..."
          aria-label="Search"
          onChange={typeToSearch}
        />
        <div className="dropdown-menu" ref={dropdownElementRef}>
          <h6 className=" dropdown-header">Series</h6>
          {seriesResults?.map((series) => {
            return (
              <Link key={series._id} to={`/series/${series._id}`} className="dropdown-item" onClick={closeMenu}>
                {series.seriesName}
              </Link>
            );
          })}
        </div>
      </div>
    </form>
  );
};
