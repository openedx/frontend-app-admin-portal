import React from 'react';

import { Form } from '@edx/paragon';

// Page 3 of Canvas LMS config workflow
const CanvasConfigActivatePage = () => (
  <span>
    <Form style={{ maxWidth: '60rem' }}>
      <h2>Activate your Canvas integration</h2>

      <p>
        Your Canvas integration has been successfully authorized and is ready to
        activate!
      </p>

      <p>
        Once activated, edX For Business will begin syncing content metadata and
        learner activity with Canvas.
      </p>
    </Form>
  </span>
);

export default CanvasConfigActivatePage;
