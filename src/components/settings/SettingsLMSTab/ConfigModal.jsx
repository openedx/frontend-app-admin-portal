import React from 'react';
import PropTypes from 'prop-types';
import { ModalDialog, ActionRow, Button } from '@edx/paragon';

const MODAL_TITLE = 'Do you want to save your work?';
const MODAL_TEXT = 'Your changes will be lost without saving.';

// will have to pass in individual saveDraft method and config when
// drafting is allowed
const ConfigModal = ({
  isOpen, close, onClick, saveDraft,
}) => (
  <ModalDialog
    title="Cancel Modal"
    isOpen={isOpen}
    onClose={close}
    variant="default"
  >
    <ModalDialog.Header>
      <ModalDialog.Title>
        {MODAL_TITLE}
      </ModalDialog.Title>
    </ModalDialog.Header>
    <ModalDialog.Body>
      {MODAL_TEXT}
    </ModalDialog.Body>
    <ModalDialog.Footer>
      <ActionRow>
        <Button onClick={() => onClick('')} variant="outline-primary">
          Exit without saving
        </Button>
        <Button onClick={saveDraft} variant="primary">
          Save
        </Button>
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

ConfigModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  saveDraft: PropTypes.func.isRequired,
};
export default ConfigModal;
