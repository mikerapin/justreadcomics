import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import { Dropdown } from 'bootstrap';
import { ISeries } from '../types/series';
import { fetchSeriesByName } from '../data/series';
import { Link } from 'react-router-dom';

export const Search = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdown = useRef<Dropdown | null>(null);
  const [seriesResults, setSeriesResults] = useState<ISeries[]>();

  useEffect(() => {
    if (dropdownRef.current) {
      dropdown.current = new Dropdown(dropdownRef.current, { reference: 'parent' });
    }
  }, [dropdownRef]);

  useEffect(() => {}, [dropdownRef]);
  const typeToSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (!dropdownRef.current) {
      return;
    }
    const val = e.target.value;
    if (val.length < 2) {
      closeMenu();
      return;
    }
    fetchSeriesByName(val).then((res) => {
      setSeriesResults(res);
    });
    dropdown.current?.show();
  };

  const closeMenu = () => {
    dropdown.current?.hide();
  };

  return (
    <div className="btn-group dropdown">
      <input type="search" className="form-control" placeholder="Search..." aria-label="Search" onChange={typeToSearch} />
      <div className="dropdown-menu" ref={dropdownRef}>
        <h6 className=" dropdown-header">Series</h6>
        {seriesResults?.map((series) => {
          return (
            <Link to={`/series/${series._id}`} className="dropdown-item" onClick={closeMenu}>
              {series.seriesName}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
