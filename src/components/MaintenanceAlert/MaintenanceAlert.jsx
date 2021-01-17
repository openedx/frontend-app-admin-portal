import React from 'react';
import { Alert } from '@edx/paragon';

import { configuration } from '../../config';

export default () => {
  if (!configuration?.SHOW_MAINTENANCE_ALERT) {
    return null;
  }

  return (
    <Alert variant="warning" className="mt-3">
      edX Subscriptions and Codes will be unavailable due to planned maintenance on
      Tuesday, January 19th between 10am and 11:30am EST.
    </Alert>
  );
};
