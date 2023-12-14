import React from 'react';
import { ModalDialog, ActionRow, Button } from '@openedx/paragon';
import { UnsavedChangesModalProps } from '../../forms/FormWorkflow';

const UnsavedSSOChangesModal = ({
  isOpen,
  close,
  exitWithoutSaving,
}: UnsavedChangesModalProps) => (
  <ModalDialog
    title="Cancel Modal"
    isOpen={isOpen}
    onClose={close}
    variant="default"
  >
    <ModalDialog.Header>
      <ModalDialog.Title>Exit configuration?</ModalDialog.Title>
    </ModalDialog.Header>
    <ModalDialog.Body>
      <p>Your in-progress data will not be saved.</p>
      <p>Your SSO connection will not be active until you restart and complete the SSO configuration process.</p>
    </ModalDialog.Body>
    <ModalDialog.Footer>
      <ActionRow>
        <Button onClick={close} variant="outline-primary">
          Cancel
        </Button>
        <Button onClick={exitWithoutSaving} variant="primary">
          Exit
        </Button>
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

export default UnsavedSSOChangesModal;
