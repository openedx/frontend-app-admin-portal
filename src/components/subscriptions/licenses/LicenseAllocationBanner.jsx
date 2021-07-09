import React, { useState } from 'react';

import { Alert } from '@edx/paragon';

export const ALLOCATION_BANNER_TEXT = 'In accordance with edX privacy policies, learners that do not activate their allocated'
+ ' licenses within 90 days of invitation are purged from the record tables below.';
/**
 * Displays simple dismissible banner to remind admins.
 */
const LicenseAllocationBanner = () => {
  const [closed, setClosed] = useState(false);

  if (closed) { return null; }

  return (
    <Alert
      className="license-allocation-alert"
      onClose={() => setClosed(true)}
      variant="info"
      dismissible
    >
      {ALLOCATION_BANNER_TEXT}
    </Alert>
  );
};

export default LicenseAllocationBanner;
