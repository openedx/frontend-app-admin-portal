import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@edx/paragon';
import { BookOpen } from '@edx/paragon/icons';

/**
 * Bulk action button, meant to be used in License management page to initiate Bulk Enrollment Dialog
 */
const BulkEnrollButton = ({ learners, handleEnrollment }) => (
  <Button
    variant="primary"
    onClick={handleEnrollment}
    iconBefore={BookOpen}
    disabled={learners?.length < 1}
  >
    Enroll ({learners?.length })
  </Button>
);

BulkEnrollButton.propTypes = {
  handleEnrollment: PropTypes.func.isRequired,
  learners: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

export default BulkEnrollButton;
