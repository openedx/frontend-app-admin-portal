import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@openedx/paragon';
import { BookOpen } from '@openedx/paragon/icons';

/**
 * Bulk action button, meant to be used in License management page to initiate Bulk Enrollment Dialog
 * @param {object} args Arguments
 * @param {array<string>} args.learners set of learners being enrolled
 * @param {Function} args.handleEnrollment function to invoke to enroll
 * @param {string} args.buttonType type (to distinguish buttons in the dom)
 */
const BulkEnrollButton = ({ learners, handleEnrollment, buttonType }) => (
  <Button
    variant="primary"
    onClick={handleEnrollment}
    iconBefore={BookOpen}
    disabled={learners.length < 1}
    data-testid={buttonType}
  >
    Enroll ({learners.length })
  </Button>
);

BulkEnrollButton.defaultProps = {
  buttonType: 'BULK_ENROLL_DEFAULT',
};

BulkEnrollButton.propTypes = {
  handleEnrollment: PropTypes.func.isRequired,
  learners: PropTypes.arrayOf(PropTypes.string).isRequired,
  buttonType: PropTypes.string,
};

export default BulkEnrollButton;
