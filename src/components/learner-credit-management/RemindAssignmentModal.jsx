import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { Mail } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';

const RemindAssignmentModal = ({
  remindButtonState, remindContentAssignments, close, isOpen, uuidCount, trackEvent,
}) => {
  const {
    successfulReminderToast: { displayToastForAssignmentReminder },
  } = useContext(BudgetDetailPageContext);
  const intl = useIntl();
  const handleOnClick = async () => {
    await remindContentAssignments();
    trackEvent();
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
          <FormattedMessage
            id="lcm.budget.detail.page.catalog.tab.remind.assignment.modal.title"
            defaultMessage="Remind learner?"
            description="Title for the remind assignment modal"
          />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.catalog.tab.remind.assignment.modal.body"
            defaultMessage="You are sending a reminder email to the selected learner to take the next step on the course you assigned."
            description="Text1 for the body of the remind assignment modal"
          />
        </p>
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.catalog.tab.remind.assignment.modal.body2"
            defaultMessage="When your learner completes enrollment, the associated {doubleQoute}assigned{doubleQoute} funds will be marked as {doubleQoute}spent{doubleQoute}."
            description="Text2 for the body of the remind assignment modal"
            values={{ doubleQoute: '"' }}
          />
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage
              id="lcm.budget.detail.page.catalog.tab.remind.assignment.modal.close"
              defaultMessage="Go back"
              description="Text for the close button in the remind assignment modal"
            />
          </ModalDialog.CloseButton>
          <StatefulButton
            iconBefore={remindButtonState === 'default' ? Mail : null}
            labels={{
              default: uuidCount > 1
                ? intl.formatMessage({
                  id: 'lcm.budget.detail.page.catalog.tab.remind.assignment.modal.send.multiple.reminder',
                  defaultMessage: 'Send reminders ({uuidCount, number})',
                  description: 'Text for the button to send reminders through email when we have more than one assignments',
                }, { uuidCount })
                : intl.formatMessage({
                  id: 'lcm.budget.detail.page.catalog.tab.remind.assignment.modal.send.single.reminder',
                  defaultMessage: 'Send reminder',
                  description: 'Text for the button to send reminders through email when we have only one assignment',
                }),
              pending: intl.formatMessage({
                id: 'lcm.budget.detail.page.catalog.tab.remind.assignment.modal.sending',
                defaultMessage: 'Sending...',
                description: 'Text for the button when sending reminders',
              }),
              complete: intl.formatMessage({
                id: 'lcm.budget.detail.page.catalog.tab.remind.assignment.modal.reminded',
                defaultMessage: 'Reminded',
                description: 'Text for the button when reminders have been sent',
              }),
              error: intl.formatMessage({
                id: 'lcm.budget.detail.page.catalog.tab.remind.assignment.modal.error',
                defaultMessage: 'Try again',
                description: 'Text for the button when reminders have failed to send',
              }),
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
  trackEvent: PropTypes.func.isRequired,
};

export default RemindAssignmentModal;
