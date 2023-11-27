import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, ModalDialog, StatefulButton,
} from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';

const CancelAssignmentModal = ({
  assignButtonState,
  cancelContentAssignments,
  close,
  isOpen,
  uuidCount,
}) => {
  const {
    successfulCancellationToast: { displayToastForAssignmentCancellation },
  } = useContext(BudgetDetailPageContext);

  const handleOnClick = () => {
    cancelContentAssignments();
    displayToastForAssignmentCancellation(uuidCount);
  };

  return (
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
        <p>The learner will be notified that you have canceled the assignment. The funds associated with
          this course assignment will move from &quot;assigned&quot; back to &quot;available&quot;.
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">Go back</ModalDialog.CloseButton>
          <StatefulButton
            iconBefore={assignButtonState === 'default' ? DoNotDisturbOn : null}
            labels={{
              default: uuidCount > 1 ? `Cancel assignments (${uuidCount})` : 'Cancel assignment',
              pending: 'Canceling...',
              complete: 'Canceled',
              error: 'Try again',
            }}
            variant="danger"
            state={assignButtonState}
            onClick={handleOnClick}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

CancelAssignmentModal.propTypes = {
  assignButtonState: PropTypes.string.isRequired,
  cancelContentAssignments: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  uuidCount: PropTypes.number,
};

export default CancelAssignmentModal;
