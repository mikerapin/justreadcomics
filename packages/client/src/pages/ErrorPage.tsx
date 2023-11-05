import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import React from 'react';

export function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      // ...
    } else if (error.status === 404) {
      // ...
    }

    return (
      <div id="error-page">
        <Helmet>
          <title>just read comics | error</title>
        </Helmet>
        <h1>Oops! {error.status}</h1>
        <p>{error.statusText}</p>
        {error.data?.message && (
          <p>
            <i>{error.data.message}</i>
          </p>
        )}
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div id="error-page">
        <Helmet>
          <title>just read comics | error</title>
        </Helmet>
        <h1>Oops! Unexpected Error</h1>
        <p>Something went wrong.</p>
        <p>
          <i>{error.message}</i>
        </p>
      </div>
    );
  } else {
    return <></>;
  }
}

export default ErrorPage;
