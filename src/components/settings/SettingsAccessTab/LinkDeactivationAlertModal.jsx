import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  AlertModal,
  Button,
  StatefulButton,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import LmsApiService from '../../../data/services/LmsApiService';

const LinkDeactivationAlertModal = ({
  isOpen,
  onClose,
  onDeactivateLink,
  inviteKeyUUID,
}) => {
  const [deactivationState, setDeactivationState] = useState('default');
  const intl = useIntl();

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
      default: intl.formatMessage({
        id: 'adminPortal.settings.access.deactivateLinkButton',
        defaultMessage: 'Deactivate',
        description: 'Label for the deactivate link button.',
      }),
      pending: intl.formatMessage({
        id: 'adminPortal.settings.access.deactivateLinkButton.pending',
        defaultMessage: 'Deactivating...',
        description: 'Label for the deactivate link button in pending state.',
      }),
    },
    variant: 'primary',
    state: deactivationState,
    onClick: handleLinkDeactivation,
  };

  return (
    <AlertModal
      title={intl.formatMessage({
        id: 'adminPortal.settings.access.deactivateLinkModalTitle',
        defaultMessage: 'Are you sure?',
        description: 'Title for the deactivate link confirmation modal.',
      })}
      isOpen={isOpen}
      onClose={handleClose}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={handleClose}>
            <FormattedMessage
              id="adminPortal.settings.access.deactivateLinkModalCancel"
              defaultMessage="Go back"
              description="Label for the go back button."
            />
          </Button>
          <StatefulButton
            {...deactivateBtnProps}
            data-testid="deactivate-modal-confirmation"
          >
            <FormattedMessage
              id="adminPortal.settings.access.deactivateLinkButton"
              defaultMessage="Deactivate"
              description="Label for the deactivate link button."
            />
          </StatefulButton>
        </ActionRow>
      )}
    >
      <p>
        <FormattedMessage
          id="adminPortal.settings.access.deactivateLinkModalDescription"
          defaultMessage="If you disable a link, it cannot be reactivated."
          description="Description for the deactivate link confirmation modal."
        />
      </p>
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
