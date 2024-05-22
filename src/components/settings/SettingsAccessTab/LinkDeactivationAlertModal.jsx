import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  AlertModal,
  Button,
  StatefulButton,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import LmsApiService from '../../../data/services/LmsApiService';

const LinkDeactivationAlertModal = ({
  isOpen,
  onClose,
  onDeactivateLink,
  inviteKeyUUID,
}) => {
  const [deactivationState, setDeactivationState] = useState('default');

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleLinkDeactivation = () => {
    const deactivateLink = async () => {
      setDeactivationState('pending');
      try {
        await LmsApiService.disableEnterpriseCustomerLink(inviteKeyUUID);
        if (onDeactivateLink) {
          onDeactivateLink();
        }
      } catch (error) {
        logError(error);
      }
    };
    deactivateLink();
  };

  const deactivateBtnProps = {
    labels: {
      default: 'Deactivate',
      pending: 'Deactivating...',
    },
    variant: 'primary',
    state: deactivationState,
    onClick: handleLinkDeactivation,
  };

  return (
    <AlertModal
      title="Are you sure?"
      isOpen={isOpen}
      onClose={handleClose}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={handleClose}>Go back</Button>
          <StatefulButton
            {...deactivateBtnProps}
            data-testid="deactivate-modal-confirmation"
          >
            Deactivate
          </StatefulButton>
        </ActionRow>
      )}
    >
      <p>If you disable a link, it cannot be reactivated.</p>
    </AlertModal>
  );
};

LinkDeactivationAlertModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onDeactivateLink: PropTypes.func,
  inviteKeyUUID: PropTypes.string.isRequired,
};

LinkDeactivationAlertModal.defaultProps = {
  isOpen: false,
  onClose: undefined,
  onDeactivateLink: undefined,
};

export default LinkDeactivationAlertModal;
