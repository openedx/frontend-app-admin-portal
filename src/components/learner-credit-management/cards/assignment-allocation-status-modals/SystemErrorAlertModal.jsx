import React from 'react';
import PropTypes from 'prop-types';
import { ActionRow, AlertModal, Button } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import { commonErrorAlertModalPropTypes } from '../data';

const SystemErrorAlertModal = ({
  isErrorModalOpen,
  closeErrorModal,
  closeAssignmentModal,
  retry,
}) => {
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
        We&apos;re sorry. Something went wrong behind the scenes. Please
        try again, or reach out to customer support for help.
      </p>
    </AlertModal>
  );
};

SystemErrorAlertModal.propTypes = {
  ...commonErrorAlertModalPropTypes,
  retry: PropTypes.func.isRequired,
};

export default SystemErrorAlertModal;
