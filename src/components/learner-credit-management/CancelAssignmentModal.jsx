import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { DoNotDisturbOn } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';

const CancelAssignmentModal = ({
  cancelButtonState,
  cancelContentAssignments,
  close,
  isOpen,
  uuidCount,
  trackEvent,
}) => {
  const {
    successfulCancellationToast: { displayToastForAssignmentCancellation },
  } = useContext(BudgetDetailPageContext);
  const intl = useIntl();
  const handleOnClick = async () => {
    await cancelContentAssignments();
    trackEvent();
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
          <FormattedMessage
            id="lcm.budget.detail.page.catalog.tab.cancel.assignment.modal.title"
            defaultMessage="Cancel assignment?"
            description="Title for the cancel assignment modal"
          />
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.catalog.tab.cancel.assignment.modal.body"
            defaultMessage="This action cannot be undone."
            description="Body text for the cancel assignment modal which warns the user that the action cannot be undone."
          />
        </p>
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.catalog.tab.cancel.assignment.modal.body2"
            defaultMessage="The learner will be notified that you have canceled the assignment. The funds associated with this course assignment will move from {doubleQoute}assigned{doubleQoute} back to {doubleQoute}available{doubleQoute}."
            description="Body text for the cancel assignment modal which informs the user that the learner will be notified that the assignment has been canceled."
            values={{ doubleQoute: '"' }}
          />
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage
              id="lcm.budget.detail.page.catalog.tab.cancel.assignment.modal.close.button"
              defaultMessage="Close"
              description="Close button text for the cancel assignment modal"
            />
          </ModalDialog.CloseButton>
          <StatefulButton
            iconBefore={cancelButtonState === 'default' ? DoNotDisturbOn : null}
            labels={{
              default: uuidCount > 1
                ? intl.formatMessage({
                  id: 'lcm.budget.detail.page.catalog.tab.cancel.assignment.modal.cancel.multiple.assignment.button',
                  defaultMessage: 'Cancel assignments ({uuidCount})',
                  description: 'Button text for canceling assignments when we have multiple assignments to cancel',
                }, { uuidCount })
                : intl.formatMessage({
                  id: 'lcm.budget.detail.page.catalog.tab.cancel.assignment.modal.cancel.single.assignment.button',
                  defaultMessage: 'Cancel assignment',
                  description: 'Button text for canceling assignments when we have only one assignment to cancel',
                }),
              pending: intl.formatMessage({
                id: 'lcm.budget.detail.page.catalog.tab.cancel.assignment.modal.canceling.state',
                defaultMessage: 'Canceling...',
                description: 'Button state text for canceling assignments',
              }),
              complete: intl.formatMessage({
                id: 'lcm.budget.detail.page.catalog.tab.cancel.assignment.modal.canceled.state',
                defaultMessage: 'Canceled',
                description: 'Button state text for canceled assignments',
              }),
              error: intl.formatMessage({
                id: 'lcm.budget.detail.page.catalog.tab.cancel.assignment.modal.try.again',
                defaultMessage: 'Try again',
                description: 'Button state text for trying to cancel assignments again',
              }),
            }}
            variant="danger"
            state={cancelButtonState}
            onClick={handleOnClick}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

CancelAssignmentModal.propTypes = {
  cancelButtonState: PropTypes.string.isRequired,
  cancelContentAssignments: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  uuidCount: PropTypes.number,
  trackEvent: PropTypes.func.isRequired,
};

export default CancelAssignmentModal;
