import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { Mail } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';

const BulkRemindApprovedRequestModal = ({
  remindButtonState,
  remindApprovedRequests,
  close,
  isOpen,
  uuidCount,
  trackEvent,
}) => {
  const { successfulReminderToast } = useContext(BudgetDetailPageContext);
  const { displayToastForAssignmentReminder: displayToastForRequestReminder } = successfulReminderToast;
  const intl = useIntl();
  const isMultiple = uuidCount > 1;

  const handleOnClick = async () => {
    try {
      await remindApprovedRequests();
      if (trackEvent) {
        trackEvent();
      }
      if (displayToastForRequestReminder) {
        displayToastForRequestReminder(uuidCount);
      }
    } catch (error) {
      // Error is already handled in the hook, just track the event
      if (trackEvent) {
        trackEvent();
      }
    }
  };

  return (
    <ModalDialog
      hasCloseButton
      isOpen={isOpen}
      onClose={close}
      title="Bulk remind dialog"
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {isMultiple ? (
            <FormattedMessage
              id="lcm.budget.detail.page.approved.requests.bulk.remind.modal.title.multiple"
              defaultMessage="Remind {count} learners?"
              description="Title for the bulk remind request modal when multiple learners are selected"
              values={{ count: uuidCount }}
            />
          ) : (
            <FormattedMessage
              id="lcm.budget.detail.page.approved.requests.bulk.remind.modal.title.single"
              defaultMessage="Remind learner?"
              description="Title for the bulk remind request modal when single learner is selected"
            />
          )}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p>
          {isMultiple ? (
            <FormattedMessage
              id="lcm.budget.detail.page.approved.requests.bulk.remind.modal.body.multiple"
              defaultMessage="You are about to send reminder emails to {count} learners to take the next step on the courses they requested."
              description="Body text for the bulk remind request modal when multiple learners are selected"
              values={{ count: uuidCount }}
            />
          ) : (
            <FormattedMessage
              id="lcm.budget.detail.page.approved.requests.bulk.remind.modal.body.single"
              defaultMessage="You are sending a reminder email to the selected learner to take the next step on the course they requested."
              description="Body text for the bulk remind request modal when single learner is selected"
            />
          )}
        </p>
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.approved.requests.bulk.remind.modal.body2"
            defaultMessage={'When your learners complete enrollment, the associated "pending" funds will be marked as "spent".'}
            description="Secondary body text for the bulk remind request modal"
          />
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage
              id="lcm.budget.detail.page.approved.requests.bulk.remind.modal.close"
              defaultMessage="Go back"
              description="Text for the close button in the bulk remind request modal"
            />
          </ModalDialog.CloseButton>
          <StatefulButton
            iconBefore={remindButtonState === 'default' ? Mail : null}
            labels={{
              default: isMultiple
                ? intl.formatMessage(
                  {
                    id: 'lcm.budget.detail.page.approved.requests.bulk.remind.modal.send.multiple.reminder',
                    defaultMessage: 'Send reminders ({count})',
                    description: 'Text for the button to send reminders when multiple requests are selected',
                  },
                  { count: uuidCount },
                )
                : intl.formatMessage({
                  id: 'lcm.budget.detail.page.approved.requests.bulk.remind.modal.send.single.reminder',
                  defaultMessage: 'Send reminder',
                  description: 'Text for the button to send reminder when single request is selected',
                }),
              pending: intl.formatMessage({
                id: 'lcm.budget.detail.page.approved.requests.bulk.remind.modal.sending',
                defaultMessage: 'Sending...',
                description: 'Text for the button when sending reminders',
              }),
              complete: intl.formatMessage({
                id: 'lcm.budget.detail.page.approved.requests.bulk.remind.modal.reminded',
                defaultMessage: 'Sent',
                description: 'Text for the button when reminders have been sent',
              }),
              error: intl.formatMessage({
                id: 'lcm.budget.detail.page.approved.requests.bulk.remind.modal.error',
                defaultMessage: 'Try again',
                description: 'Text for the button when reminders have failed to send',
              }),
            }}
            variant="primary"
            state={remindButtonState}
            onClick={handleOnClick}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

BulkRemindApprovedRequestModal.propTypes = {
  remindButtonState: PropTypes.string.isRequired,
  remindApprovedRequests: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  uuidCount: PropTypes.number.isRequired,
  trackEvent: PropTypes.func,
};

BulkRemindApprovedRequestModal.defaultProps = {
  trackEvent: null,
};

export default BulkRemindApprovedRequestModal;
