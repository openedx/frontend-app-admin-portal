import React from 'react';
import { Toast } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

interface UpdateAddressSuccessToastProps {
  show: boolean;
  onClose: () => void;
}

const UpdateAddressSuccessToast: React.FC<UpdateAddressSuccessToastProps> = ({ show, onClose }) => {
  const intl = useIntl();
  const message = intl.formatMessage({
    id: 'admin.portal.billing.billingAddress.success',
    defaultMessage: 'Billing address updated successfully.',
    description: 'Success message for updating billing address',
  });

  return (
    <Toast show={show} onClose={onClose}>
      {message}
    </Toast>
  );
};

export default UpdateAddressSuccessToast;
