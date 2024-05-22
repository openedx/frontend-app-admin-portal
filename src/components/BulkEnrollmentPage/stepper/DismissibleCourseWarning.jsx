import React, { useState } from 'react';

import { Alert } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { WARNING_ALERT_TITLE_TEXT, WARNING_ALERT_BODY_TEXT } from './constants';

/**
 * Displays simple dismissible banner to remind admins.
 */
const DismissibleCourseWarning = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Alert
      variant="warning"
      dismissible
      icon={WarningFilled}
      show={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <Alert.Heading>{WARNING_ALERT_TITLE_TEXT}</Alert.Heading>
      <p>
        {WARNING_ALERT_BODY_TEXT}
      </p>
    </Alert>
  );
};

export default DismissibleCourseWarning;
