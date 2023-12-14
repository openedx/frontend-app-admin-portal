import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { Mail } from '@openedx/paragon/icons';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';

const RemindAssignmentModal = ({
  remindButtonState, remindContentAssignments, close, isOpen, uuidCount,
}) => {
  const {
    successfulReminderToast: { displayToastForAssignmentReminder },
  } = useContext(BudgetDetailPageContext);

  const handleOnClick = async () => {
    await remindContentAssignments();
    displayToastForAssignmentReminder(uuidCount);
  };

  return (
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
        <p>You are sending a reminder email to the selected learner
          to take the next step on the course you assigned.
        </p>
        <p>When your learner completes enrollment, the associated
          &quot;assigned&quot; funds will be marked as &quot;spent&quot;.
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">Go back</ModalDialog.CloseButton>
          <StatefulButton
            iconBefore={remindButtonState === 'default' ? Mail : null}
            labels={{
              default: uuidCount > 1 ? `Send reminders (${uuidCount})` : 'Send reminder',
              pending: 'Reminding...',
              complete: 'Reminded',
              error: 'Try again',
            }}
            variant="danger"
            state={remindButtonState}
            onClick={handleOnClick}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

RemindAssignmentModal.propTypes = {
  remindButtonState: PropTypes.string.isRequired,
  remindContentAssignments: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  uuidCount: PropTypes.number,
};

export default RemindAssignmentModal;
