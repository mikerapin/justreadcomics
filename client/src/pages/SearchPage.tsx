import React, { useEffect, useState } from 'react';
import { Form, useSearchParams } from 'react-router-dom';
import { fetchSeriesByName } from '../data/series';
import { IFetchMultipleSeriesWithCursor } from '../types/series';
import { ResultCard } from '../components/ResultCard';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<IFetchMultipleSeriesWithCursor>();
  const search = searchParams.get('s');

  useEffect(() => {
    if (search) {
      fetchSeriesByName({ seriesName: search, isLargeSearch: true, cursor: 0 }).then((results) => {
        setSearchResults(results);
      });
    }
  }, [search, searchParams]);

  const getNavigation = () => {
    if (!searchResults) {
      return <></>;
    }
    const { hasNextPage, hasPrevPage } = searchResults;

    return (
      <div className="row">
        {hasPrevPage ?? <div>prev</div>}
        {hasNextPage ?? <div>next</div>}
      </div>
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('#page-search') as HTMLInputElement;
    if (input && input.value.length) {
      searchParams.set('s', input.value);
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="container">
      <Form role="search" action="/search" onSubmit={onSubmit}>
        <div className="d-flex g-3">
          <div>
            <h2 className="me-2">Search:</h2>
          </div>
          <input
            className="form-control"
            autoComplete="off"
            name="search"
            id="page-search"
            type="text"
            defaultValue={search ?? undefined}
            aria-label="Search..."
          />
        </div>
      </Form>
      <div className="mt-3 row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
        {searchResults?.data?.map((hydratedSeries) => (
          <ResultCard key={hydratedSeries.series._id} hydratedSeries={hydratedSeries} />
        ))}
      </div>
      {getNavigation()}
    </div>
  );
};
