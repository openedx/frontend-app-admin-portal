import React from 'react';
import { Helmet } from 'react-helmet';

export const NotFound = () => (
  <>
    <Helmet>
      <title>Page Not Found</title>
    </Helmet>
    <div className="text-center py-5" data-testid="not-found-page">
      <h1 data-testid="not-found-error">404</h1>
      <p className="lead">Oops, sorry we can&apos;t find that page!</p>
      <p>Either something went wrong or the page doesn&apos;t exist anymore.</p>
    </div>
  </>
);

const NotFoundPage = () => (
  <main role="main">
    <div className="container-fluid mt-3">
      <NotFound />
    </div>
  </main>
);

export default NotFoundPage;
