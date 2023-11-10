import React, { useEffect, useState } from 'react';
import { Form, useSearchParams } from 'react-router-dom';
import { fetchSeriesByName } from '../data/series';
import { IFetchMultipleSeriesWithCursor } from '../types/series';
import { ResultCard } from '../components/ResultCard';
import { Pagination } from '../components/Pagination';
import { Helmet } from 'react-helmet-async';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cursor, setCursor] = useState<number>(parseInt(searchParams?.get('cursor') ?? '0'));
  const [searchResults, setSearchResults] = useState<IFetchMultipleSeriesWithCursor>();
  const search = searchParams.get('s');

  useEffect(() => {
    if (search) {
      fetchSeriesByName({ seriesName: search, isLargeSearch: true, cursor: cursor }).then((results) => {
        setSearchResults(results);
      });
    }
  }, [search, cursor, searchParams]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('#page-search') as HTMLInputElement;
    if (input && input.value.length > 2) {
      searchParams.set('s', input.value);
      setSearchParams(searchParams);
    }
  };

  const updateCursor = (newCursor: number) => {
    setCursor(newCursor);
    searchParams.set('cursor', `${newCursor}`);
    setSearchParams(searchParams);
  };

  const nextPage = () => {
    if (searchResults?.hasNextPage) {
      setCursor(cursor + 1);
      updateCursor(cursor + 1);
    }
  };

  const prevPage = () => {
    if (searchResults?.hasPrevPage) {
      const newCursor = cursor - 1;
      updateCursor(newCursor);
    }
  };

  return (
    <div className="container">
      <Helmet>
        <title>just read comics | Search</title>
      </Helmet>
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
      <Pagination hasNext={searchResults?.hasNextPage} hasPrev={searchResults?.hasPrevPage} nextAction={nextPage} prevAction={prevPage} />
    </div>
  );
};
