import React from 'react';
import { Alert } from '@edx/paragon';

import { configuration } from '../../config';

export default () => {
  if (!configuration?.SHOW_LEARNER_REPORT_MAINTENANCE_ALERT) {
    return null;
  }

  return (
    <Alert variant="warning" className="mt-3">
      Learner Progress Report will be down for planned maintenance on Wednesday, December 16th from 10am-12pm EST
    </Alert>
  );
};
