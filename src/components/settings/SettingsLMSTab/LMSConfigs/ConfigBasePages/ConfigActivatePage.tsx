import React from 'react';

import { Form } from '@edx/paragon';

const ConfigActivatePage = ({ lmsType }) => (
  <span>
    <Form style={{ maxWidth: '60rem' }}>
      <h2>Activate your {lmsType} integration</h2>

      <p>
        Your {lmsType} integration has been successfully authorized and is ready to
        activate!
      </p>

      <p>
        Once activated, edX For Business will begin syncing content metadata and
        learner activity with {lmsType}.
      </p>
    </Form>
  </span>
);

export default ConfigActivatePage;
