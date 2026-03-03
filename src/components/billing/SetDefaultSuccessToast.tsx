import React from 'react';
import { Toast } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

interface SetDefaultSuccessToastProps {
  show: boolean;
  onClose: () => void;
}

const SetDefaultSuccessToast: React.FC<SetDefaultSuccessToastProps> = ({ show, onClose }) => {
  const intl = useIntl();
  const message = intl.formatMessage({
    id: 'admin.portal.billing.setDefault.success',
    defaultMessage: 'Default payment method updated.',
    description: 'Success message for set default payment method action',
  });

  return (
    <Toast show={show} onClose={onClose}>
      {message}
    </Toast>
  );
};

export default SetDefaultSuccessToast;
