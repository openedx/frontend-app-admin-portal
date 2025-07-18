import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { Mail } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';

const RemindApprovedRequestModal = ({
  remindButtonState, remindApprovedRequests, close, isOpen, trackEvent,
}) => {
  const { successfulReminderToast } = useContext(BudgetDetailPageContext);
  const { displayToastForAssignmentReminder: displayToastForRequestReminder } = successfulReminderToast;
  const intl = useIntl();

  const handleOnClick = async () => {
    try {
      await remindApprovedRequests();
      trackEvent();
      // Only show toast on successful cancellation
      // We don't yet support bulk reminders for Bnr, so we assume uuidCount is always 1
      if (displayToastForRequestReminder) {
        displayToastForRequestReminder(1);
      }
    } catch (error) {
      // Error is already handled in the hook, just track the event
      trackEvent();
    }
  };

  return (
    <ModalDialog
      hasCloseButton
      isOpen={isOpen}
      onClose={close}
      title="Remind dialog"
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage
            id="lcm.budget.detail.page.approved.requests.remind.modal.title"
            defaultMessage="Remind learner?"
            description="Title for the remind request modal"
          />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.approved.requests.remind.modal.body"
            defaultMessage="You are sending a reminder email to the selected learner to take the next step on the course they requested."
            description="Text1 for the body of the remind request modal"
          />
        </p>
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.approved.requests.remind.modal.body2"
            defaultMessage={'When your learner completes enrollment, the associated "pending" funds will be marked as "spent".'}
            description="Text2 for the body of the remind request modal"
          />
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage
              id="lcm.budget.detail.page.approved.requests.remind.modal.close"
              defaultMessage="Go back"
              description="Text for the close button in the remind request modal"
            />
          </ModalDialog.CloseButton>
          <StatefulButton
            iconBefore={remindButtonState === 'default' ? Mail : null}
            labels={{
              default: intl.formatMessage({
                id: 'lcm.budget.detail.page.approved.requests.remind.modal.send.single.reminder',
                defaultMessage: 'Send reminder',
                description: 'Text for the button to send reminders through email when we have only one request',
              }),
              pending: intl.formatMessage({
                id: 'lcm.budget.detail.page.approved.requests.remind.modal.sending',
                defaultMessage: 'Sending...',
                description: 'Text for the button when sending reminders',
              }),
              complete: intl.formatMessage({
                id: 'lcm.budget.detail.page.approved.requests.remind.modal.reminded',
                defaultMessage: 'Reminded',
                description: 'Text for the button when reminders have been sent',
              }),
              error: intl.formatMessage({
                id: 'lcm.budget.detail.page.approved.requests.remind.modal.error',
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

RemindApprovedRequestModal.propTypes = {
  remindButtonState: PropTypes.string.isRequired,
  remindApprovedRequests: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  trackEvent: PropTypes.func.isRequired,
};

export default RemindApprovedRequestModal;
