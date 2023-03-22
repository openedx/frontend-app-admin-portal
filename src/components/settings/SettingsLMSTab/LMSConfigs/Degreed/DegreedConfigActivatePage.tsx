import React from 'react';

import { Form } from '@edx/paragon';

const DegreedConfigActivatePage = () => (
  <span>
    <Form style={{ maxWidth: '60rem' }}>
      <h2>Activate your Degreed integration</h2>

      <p>
        Your Degreed integration has been successfully created and is ready to
        activate!
      </p>

      <p>
        Once activated, edX For Business will begin syncing content metadata and
        learner activity with Degreed.
      </p>
    </Form>
  </span>
);

export default DegreedConfigActivatePage;
