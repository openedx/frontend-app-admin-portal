import React from 'react';
import PropTypes from 'prop-types';
import { Toast } from '@openedx/paragon';

/**
 * Toast component for subscription operation errors
 */
const SubscriptionErrorToast = ({
  show,
  onClose,
  message,
}: {
  show: boolean;
  onClose: () => void;
  message: string;
}) => (
  <Toast
    show={show}
    onClose={onClose}
  >
    {message}
  </Toast>
);

SubscriptionErrorToast.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};

export default SubscriptionErrorToast;
