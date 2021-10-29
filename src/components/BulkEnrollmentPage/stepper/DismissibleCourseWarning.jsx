import React, { useState } from 'react';

import { Alert, WarningFilled } from '@edx/paragon';
import { WARNING_ALERT_TITLE_TEXT, WARNING_ALERT_BODY_TEXT } from './constants';

/**
 * Displays simple dismissible banner to remind admins.
 */
const DismissibleCourseWarning = () => {
  const [closed, setClosed] = useState(false);

  if (closed) { return null; }

  return (
    <Alert
      variant="warning"
      dismissible
      icon={WarningFilled}
      onClose={() => setClosed(true)}
    >
      <Alert.Heading>{WARNING_ALERT_TITLE_TEXT}</Alert.Heading>
      <p>
        {WARNING_ALERT_BODY_TEXT}
      </p>
    </Alert>
  );
};

export default DismissibleCourseWarning;
