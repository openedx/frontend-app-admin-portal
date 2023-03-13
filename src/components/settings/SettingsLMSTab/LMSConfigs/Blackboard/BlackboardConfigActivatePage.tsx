import React from 'react';

import { Form } from '@edx/paragon';

// Page 3 of Blackboard LMS config workflow
const BlackboardConfigActivatePage = () => (
  <span>
    <Form style={{ maxWidth: '60rem' }}>
      <h2>Activate your Blackboard integration</h2>

      <p>
        Your Blackboard integration has been successfully authorized and is ready to
        activate!
      </p>

      <p>
        Once activated, edX For Business will begin syncing content metadata and
        learner activity with Blackboard.
      </p>
    </Form>
  </span>
);

export default BlackboardConfigActivatePage;
