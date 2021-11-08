import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FullscreenModal } from '@edx/paragon';

import BulkEnrollContextProvider from './BulkEnrollmentContext';
import BulkEnrollmentStepper from './stepper/BulkEnrollmentStepper';

/**
 * Full screen dialog to house Bulk enrollment workflow that starts after selecting learners and
 * clicking 'Enroll'. Course selection will happen as part of the workflow in this window.
 * Learner emails will be sourced from whatever learner emails were selected before opening this
 * dialog, from the license management bulk actions table
 *
 * @param {object} args
 * @param {array<object>} args.learners learner email list to enroll
 * @param {object} args.subscription subscription plan to enroll into
 * @param {boolean} args.isOpen whether to show dialog (for controlling open/close)
 * @param {function} args.onClose handler to call on dialog close event
 * @returns Full screen modal dialog from Paragon
 */
const BulkEnrollDialog = ({
  enterpriseId, enterpriseSlug, learners, subscription, isOpen, onClose,
}) => (
  <FullscreenModal
    hasCloseButton
    title="Subscription Enrollment"
    isOpen={isOpen}
    onClose={onClose}
  >
    <BulkEnrollContextProvider initialEmailsList={learners}>
      <BulkEnrollmentStepper
        subscription={subscription}
        enterpriseId={enterpriseId}
        enterpriseSlug={enterpriseSlug}
        onEnrollComplete={onClose}
      />
    </BulkEnrollContextProvider>
  </FullscreenModal>
);

BulkEnrollDialog.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  learners: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  subscription: PropTypes.shape({ title: PropTypes.string.isRequired }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BulkEnrollDialog);
