import React from 'react';
import { Helmet } from 'react-helmet';
import { MailtoLink } from '@edx/paragon';

import H1 from '../../components/H1';

const SupportPage = () => (
  <main role="main">
    <div className="container-fluid mt-3">
      <Helmet>
        <title>Support</title>
      </Helmet>
      <H1>Support</H1>
      <p>
        For assistance, please contact edX Enterprise Support at
        {' '}
        <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>.
      </p>
    </div>
  </main>
);

export default SupportPage;
