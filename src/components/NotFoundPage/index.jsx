import React from 'react';
import Helmet from 'react-helmet';

function NotFoundPage() {
  return (
    <main role="main">
      <div className="container-fluid mt-3">
        <NotFound />
      </div>
    </main>
  );
}

export function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found</title>
      </Helmet>
      <div className="text-center py-5">
        <h1>404</h1>
        <p className="lead">Oops, sorry we can&apos;t find that page!</p>
        <p>Either something went wrong or the page doesn&apos;t exist anymore.</p>
      </div>
    </>
  );
}

export default NotFoundPage;
