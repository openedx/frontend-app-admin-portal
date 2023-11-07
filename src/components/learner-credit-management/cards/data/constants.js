/* eslint-disable import/prefer-default-export */

import PropTypes from 'prop-types';

export const commonErrorAlertModalPropTypes = {
  isErrorModalOpen: PropTypes.bool.isRequired,
  closeErrorModal: PropTypes.func.isRequired,
  closeAssignmentModal: PropTypes.func.isRequired,
};
