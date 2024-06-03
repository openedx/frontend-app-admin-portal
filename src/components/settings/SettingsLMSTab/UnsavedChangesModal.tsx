import React from 'react';
import { ModalDialog, ActionRow, Button } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { UnsavedChangesModalProps } from '../../forms/FormWorkflow';

// will have to pass in individual saveDraft method and config when
// drafting is allowed
const UnsavedChangesModal = ({
  isOpen,
  close,
  exitWithoutSaving,
  saveDraft,
}: UnsavedChangesModalProps) => (
  <ModalDialog
    title={(
      <FormattedMessage
        id="adminPortal.settings.learningPlatformTab.unsavedChangesModal.cancelModalTitle"
        defaultMessage="Cancel Modal"
        description="Title for the cancel modal on learning platform tab"
      />
  )}
    isOpen={isOpen}
    onClose={close}
    variant="default"
  >
    <ModalDialog.Header>
      <ModalDialog.Title>
        <FormattedMessage
          id="adminPortal.settings.learningPlatformTab.unsavedChangesModal.exitConfigurationTitle"
          defaultMessage="Exit configuration"
          description="Title for exiting configuration modal dialog"
        />
      </ModalDialog.Title>
    </ModalDialog.Header>
    <ModalDialog.Body>
      <FormattedMessage
        id="adminPortal.settings.learningPlatformTab.unsavedChangesModal.saveDraftMessage"
        defaultMessage="Your configuration data will be saved under your Learning Platform settings"
        description="Message for saving draft in configuration modal dialog"
      />
    </ModalDialog.Body>
    <ModalDialog.Footer>
      <ActionRow>
        <Button onClick={close} variant="outline-primary">
          <FormattedMessage
            id="adminPortal.settings.learningPlatformTab.unsavedChangesModal.cancelButton"
            defaultMessage="Cancel"
            description="Cancel button text in configuration modal dialog"
          />
        </Button>
        <Button onClick={exitWithoutSaving} variant="outline-primary">
          <FormattedMessage
            id="adminPortal.settings.learningPlatformTab.unsavedChangesModal.exitWithoutSavingButton"
            defaultMessage="Exit without saving"
            description="Exit without saving button text in configuration modal dialog"
          />
        </Button>
        <Button onClick={saveDraft} variant="primary">
          <FormattedMessage
            id="adminPortal.settings.learningPlatformTab.unsavedChangesModal.exitButton"
            defaultMessage="Exit"
            description="Exit button text in configuration modal dialog"
          />
        </Button>
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

export default UnsavedChangesModal;
