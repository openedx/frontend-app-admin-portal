import React from 'react';
import { ModalDialog, ActionRow, Button } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { UnsavedChangesModalProps } from '../../forms/FormWorkflow';

const UnsavedSSOChangesModal = ({
  isOpen,
  close,
  exitWithoutSaving,
}: UnsavedChangesModalProps) => {
  const intl = useIntl();

  return (
    <ModalDialog
      title={intl.formatMessage({
        id: 'adminPortal.settings.sso.unsavedChangesModal.name',
        defaultMessage: 'Cancel Modal',
      })}
      isOpen={isOpen}
      onClose={close}
      variant="default"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage
            id="adminPortal.settings.sso.unsavedChangesModal.title"
            defaultMessage="Exit Configuration?"
            description="Title for the unsaved changes modal"
          />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p>
          <FormattedMessage
            id="adminPortal.settings.sso.unsavedChangesModal.body.header"
            defaultMessage="Your in-progress data will not be saved."
            description="Body header for the unsaved changes modal"
          />
        </p>
        <p>
          <FormattedMessage
            id="adminPortal.settings.sso.unsavedChangesModal.body.description"
            defaultMessage="Your SSO connection will not be active until you restart and complete the SSO configuration process."
            description="Body description for the unsaved changes modal"
          />
        </p>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button onClick={close} variant="outline-primary">
            <FormattedMessage
              id="adminPortal.settings.sso.unsavedChangesModal.cancelButton"
              defaultMessage="Cancel"
              description="Cancel button text for the unsaved changes modal"
            />
          </Button>
          <Button onClick={exitWithoutSaving} variant="primary">
            <FormattedMessage
              id="adminPortal.settings.sso.unsavedChangesModal.exitButton"
              defaultMessage="Exit"
              description="Exit button text for the unsaved changes modal"
            />
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default UnsavedSSOChangesModal;
