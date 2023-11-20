import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, ModalDialog,
} from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';

const CancelAssignmentModal = ({ cancelContentAssignments, close, isOpen, uuidCount }) => (
  <React.Fragment>
    <ModalDialog
      hasCloseButton
      isOpen={isOpen}
      onClose={close}
      title="Cancel dialog"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          Cancel assignment?
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <p>This action cannot be undone.</p>
        <p>The learner will be notified that you have canceled the assignment. The funds associated with this course assignment
          will move from "assigned" back to "available".
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">Go back</ModalDialog.CloseButton>
          <Button
            iconBefore={DoNotDisturbOn}
            onClick={cancelContentAssignments}
            variant="danger"
          >
            {uuidCount ? `Cancel assignments (${uuidCount})` : `Cancel assignment`}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  </React.Fragment>
);

CancelAssignmentModal.propTypes = {
  cancelContentAssignments: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default CancelAssignmentModal;