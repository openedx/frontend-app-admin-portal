import React from 'react';
import Helmet from 'react-helmet';
import { MailtoLink } from '@edx/paragon';

import H1 from '../../components/H1';

const ForbiddenPage = () => (
  <div className="container-fluid mt-3">
    <Helmet>
      <title>Access Denied</title>
    </Helmet>
    <div className="text-center py-5">
      <H1>403</H1>
      <p className="lead">You do not have access to this page.</p>
      <p>
        For assistance, please contact edX Enterprise Support at
        {' '}
        <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>.
      </p>
    </div>
  </div>
);

export default ForbiddenPage;
