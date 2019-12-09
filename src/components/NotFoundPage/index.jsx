import React from 'react';
import Helmet from 'react-helmet';

import H1 from '../../components/H1';

const NotFoundPage = () => (
  <main role="main">
    <div className="container-fluid mt-3">
      <Helmet>
        <title>Page Not Found</title>
      </Helmet>
      <div className="text-center py-5">
        <H1>404</H1>
        <p className="lead">Oops, sorry we can&apos;t find that page!</p>
        <p>Either something went wrong or the page doesn&apos;t exist anymore.</p>
      </div>
    </div>
  </main>
);

export default NotFoundPage;
