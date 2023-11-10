import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import { Dropdown } from 'bootstrap';
import { IHydratedSeries } from '../types/series';
import { fetchSeriesByName } from '../data/series';
import { Form, Link } from 'react-router-dom';
import { SeriesImage } from './SeriesImage';
import { useSearch } from '../hooks/search';

export const Search = () => {
  const dropdownElementRef = useRef<HTMLDivElement>(null);
  const dropdown = useRef<Dropdown | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { searchResults, setSearchTerm } = useSearch(fetchSeriesByName);

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
    setSearchTerm(val);
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

  /* Todo: not sure if I like this, so commenting for now */
  // const arrowCheck = (e: React.KeyboardEvent) => {
  //   if (dropdownElementRef.current && e.key === 'ArrowDown') {
  //     console.log('down');
  //     dropdownElementRef.current.querySelector('a')?.focus({ preventScroll: true });
  //   }
  // };

  return (
    <Form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search" action="/search">
      <div className="btn-group dropdown">
        <input
          ref={searchRef}
          type="search"
          name="s"
          className="form-control dropdown-toggle"
          data-bs-toggle="dropdown"
          data-bs-auto-close="outside"
          placeholder="Search..."
          aria-label="Search"
          onChange={typeToSearch}
          autoComplete="off"
        />
        <div className="dropdown-menu" ref={dropdownElementRef} data-bs-auto-close="outside">
          <h6 className=" dropdown-header">Series</h6>
          {searchResults?.map((hydratedSeries) => {
            const { series } = hydratedSeries;
            return (
              <Link key={series._id} to={`/series/${series._id}`} className="dropdown-item" onClick={closeMenu}>
                <div className="d-flex g-2 align-items-center">
                  <div className="d-flex align-items-center" style={{ marginRight: 10, minWidth: 48, maxHeight: 48, overflow: 'hidden' }}>
                    <SeriesImage series={series} style={{ width: 48 }} alt={series.seriesName} />
                  </div>
                  <div className="text-truncate" style={{ maxWidth: 320 }}>
                    {series.seriesName}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Form>
  );
};
