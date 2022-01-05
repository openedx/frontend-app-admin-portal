import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  AlertModal,
  Button,
  StatefulButton,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';

const DisableLinkManagementAlertModal = ({
  isOpen,
  onClose,
  onDisableLinkManagement,
}) => {
  const [modalDisableButtonState, setModalDisableButtonState] = useState('default');

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleDisableLinkManagement = () => {
    const disableLinkManagement = async () => {
      setModalDisableButtonState('pending');
      try {
        // TODO: make legit API request
        await new Promise((resolve) => {
          setTimeout(() => resolve(), 2000);
        });
        if (onDisableLinkManagement) {
          onDisableLinkManagement();
        }
      } catch (error) {
        logError(error);
      } finally {
        setModalDisableButtonState('default');
      }
    };
    disableLinkManagement();
  };

  const disableButtonProps = {
    labels: {
      default: 'Disable',
      pending: 'Disabling...',
    },
    state: modalDisableButtonState,
    variant: 'primary',
    onClick: handleDisableLinkManagement,
  };

  return (
    <AlertModal
      title="Are you sure?"
      isOpen={isOpen}
      onClose={handleClose}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={handleClose}>Go back</Button>
          <StatefulButton {...disableButtonProps}>Disable</StatefulButton>
        </ActionRow>
      )}
    >
      <p>
        If you disable access via link, all links will be deactivated and your
        learners will no longer have access. Links cannot be reactivated.
      </p>
    </AlertModal>
  );
};

DisableLinkManagementAlertModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onDisableLinkManagement: PropTypes.func,
};

DisableLinkManagementAlertModal.defaultProps = {
  isOpen: false,
  onClose: undefined,
  onDisableLinkManagement: undefined,
};

export default DisableLinkManagementAlertModal;
