import React from 'react';
import { ModalDialog, ActionRow, Button } from '@edx/paragon';
import { UnsavedChangesModalProps } from '../../forms/FormWorkflow';

const MODAL_TITLE = 'Exit configuration';
const MODAL_TEXT = 'Your configuration data will be saved under your Learning Platform settings';

// will have to pass in individual saveDraft method and config when
// drafting is allowed
const UnsavedChangesModal = ({
  isOpen,
  close,
  exitWithoutSaving,
  saveDraft,
}: UnsavedChangesModalProps) => (
  <ModalDialog
    title="Cancel Modal"
    isOpen={isOpen}
    onClose={close}
    variant="default"
  >
    <ModalDialog.Header>
      <ModalDialog.Title>{MODAL_TITLE}</ModalDialog.Title>
    </ModalDialog.Header>
    <ModalDialog.Body>{MODAL_TEXT}</ModalDialog.Body>
    <ModalDialog.Footer>
      <ActionRow>
        <Button onClick={close} variant="outline-primary">
          Cancel
        </Button>
        <Button onClick={exitWithoutSaving} variant="outline-primary">
          Exit without saving
        </Button>
        <Button onClick={saveDraft} variant="primary">
          Exit
        </Button>
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

export default UnsavedChangesModal;
