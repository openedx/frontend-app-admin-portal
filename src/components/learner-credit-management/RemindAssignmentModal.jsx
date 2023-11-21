import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, ModalDialog,
} from '@edx/paragon';

const RemindAssignmentModal = ({
  remindContentAssignments, close, isOpen, uuidCount,
}) => (
  <ModalDialog
    hasCloseButton
    isOpen={isOpen}
    onClose={close}
    title="Remind dialog"
  >
    <ModalDialog.Header>
      <ModalDialog.Title>
        Remind learner?
      </ModalDialog.Title>
    </ModalDialog.Header>
    <ModalDialog.Body>
      <p>You are sending a reminder email to the selected learner to take the next step on the course you assigned.</p>
      <p>When your learner completes enrollment, the associated “assigned” funds will be marked as “spent”.</p>
    </ModalDialog.Body>

    <ModalDialog.Footer>
      <ActionRow>
        <ModalDialog.CloseButton variant="tertiary">Go back</ModalDialog.CloseButton>
        <Button
          onClick={remindContentAssignments}
        >
          {uuidCount > 1 ? `Send reminders (${uuidCount})` : 'Send reminder'}
        </Button>
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

RemindAssignmentModal.propTypes = {
  remindContentAssignments: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  uuidCount: PropTypes.number,
};

export default RemindAssignmentModal;
