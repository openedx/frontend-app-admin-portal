import React from 'react';
import { Helmet } from 'react-helmet';
import { MailtoLink } from '@edx/paragon';

import H1 from '../../components/H1';

const FAQSupportPage = () => (
  <div className="container">
    <Helmet>
      <title>Support</title>
    </Helmet>
    <H1>Support</H1>
    <p>
      For assistance, please contact edX Enterprise Support at <MailtoLink to="enterprise@edx.org" content=" enterprise@edx.org" />.
    </p>
  </div>
);

export default FAQSupportPage;
