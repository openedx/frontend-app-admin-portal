import PropTypes from 'prop-types';

export const commonErrorAlertModalPropTypes = {
  isErrorModalOpen: PropTypes.bool.isRequired,
  closeErrorModal: PropTypes.func.isRequired,
  closeAssignmentModal: PropTypes.func.isRequired,
};

export const MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT = 15;

export const EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY = 1000;
