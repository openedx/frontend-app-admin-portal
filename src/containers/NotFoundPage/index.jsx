import React from 'react';
import Helmet from 'react-helmet';

import H1 from '../../components/H1';

const NotFoundPage = () => (
  <div className="container mt-3">
    <Helmet>
      <title>Page Not Found</title>
    </Helmet>
    <H1>Page Not Found</H1>
    <p>You&apos;re at the end of the line, pal.</p>
  </div>
);

export default NotFoundPage;
