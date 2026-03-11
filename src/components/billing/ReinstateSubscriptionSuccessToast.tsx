import React from 'react';
import PropTypes from 'prop-types';
import { Toast } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

/**
 * Toast component for successful subscription reinstatement
 */
const ReinstateSubscriptionSuccessToast = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  const intl = useIntl();

  return (
    <Toast
      show={show}
      onClose={onClose}
    >
      {intl.formatMessage({
        id: 'admin.portal.billing.subscription.reinstate.success',
        defaultMessage: 'Your subscription has been reinstated.',
      })}
    </Toast>
  );
};

ReinstateSubscriptionSuccessToast.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ReinstateSubscriptionSuccessToast;
