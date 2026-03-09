import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, AlertModal, Button } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import { commonErrorAlertModalPropTypes } from '../data';

const SystemErrorAlertModal = ({
  isErrorModalOpen,
  closeErrorModal,
  closeAssignmentModal,
  retry,
  message,
}) => {
  const intl = useIntl();
  const defaultErrorMessage = intl.formatMessage({
    id: 'systemErrorAlertModal.defaultErrorMessage',
    defaultMessage: "We're sorry. Something went wrong behind the scenes. Please try again, or reach out to customer support for help.",
    description: 'Default error message shown in the system error alert modal',
  });
  const handleClose = () => {
    closeErrorModal();
    closeAssignmentModal();
  };

  return (
    <AlertModal
      isBlocking
      variant="danger"
      icon={Error}
      title="Something went wrong"
      isOpen={isErrorModalOpen}
      onClose={closeErrorModal}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={handleClose}>Exit and discard changes</Button>
          <Button onClick={retry} data-autofocus>Try again</Button>
        </ActionRow>
      )}
      isOverflowVisible={false}
    >
      <p>
        {message || defaultErrorMessage}
      </p>
    </AlertModal>
  );
};

SystemErrorAlertModal.propTypes = {
  ...commonErrorAlertModalPropTypes,
  retry: PropTypes.func.isRequired,
  message: PropTypes.string,
};

export default SystemErrorAlertModal;
