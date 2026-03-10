import React from 'react';
import { Toast } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

interface SetDefaultErrorToastProps {
  show: boolean;
  onClose: () => void;
}

const SetDefaultErrorToast = ({ show, onClose }: SetDefaultErrorToastProps) => {
  const intl = useIntl();
  const message = intl.formatMessage({
    id: 'admin.portal.billing.setDefault.error',
    defaultMessage: 'Failed to update default payment method. Please try again.',
    description: 'Error message for set default payment method action',
  });

  return (
    <Toast show={show} onClose={onClose}>
      {message}
    </Toast>
  );
};

export default SetDefaultErrorToast;
