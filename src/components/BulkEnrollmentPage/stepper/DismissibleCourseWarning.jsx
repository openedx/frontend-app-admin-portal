import { useState } from 'react';
import PropTypes from 'prop-types';

import { Alert } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { WARNING_ALERT_TITLE_TEXT, WARNING_ALERT_BODY_TEXT } from './constants';

/**
 * Displays simple dismissible banner to remind admins.
 */
const DismissibleCourseWarning = ({ defaultShow = false }) => {
  const [isOpen, setIsOpen] = useState(defaultShow);
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

DismissibleCourseWarning.propTypes = {
  defaultShow: PropTypes.bool,
};

export default DismissibleCourseWarning;
