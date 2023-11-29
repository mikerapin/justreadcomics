import React, { useEffect, useState } from 'react';
import { fetchSeriesByName } from '../data/series';
import { IFetchMultipleSeriesWithCursor } from '../types/series';
import { ResultCard } from '../components/ResultCard';
import { Pagination } from '../components/Pagination';
import { Helmet } from 'react-helmet-async';
import { Container, Form as BootstrapForm, Row, Stack } from 'react-bootstrap';
import { Form, useSearchParams } from 'react-router-dom';

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
    <Container>
      <Helmet>
        <title>just read comics | Search</title>
      </Helmet>
      <Form role="search" action="/search" onSubmit={onSubmit}>
        <Stack direction="horizontal" gap={3} className="align-items-center mt-5">
          <h2>Search:</h2>
          <BootstrapForm.Control size="lg" type="text" placeholder="Search..." defaultValue={search ?? undefined} id="page-search" autoComplete="off" />
        </Stack>
      </Form>
      <Row xs={1} sm={2} md={3} className="mt-3 g-3">
        {searchResults?.data?.map((hydratedSeries) => (
          <ResultCard key={hydratedSeries.series._id} hydratedSeries={hydratedSeries} />
        ))}
      </Row>
      <Pagination hasNext={searchResults?.hasNextPage} hasPrev={searchResults?.hasPrevPage} nextAction={nextPage} prevAction={prevPage} />
    </Container>
  );
};
