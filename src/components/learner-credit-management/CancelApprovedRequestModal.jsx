import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { DoNotDisturbOn } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';

const CancelApprovedRequestModal = ({
  cancelButtonState,
  cancelApprovedRequest,
  close,
  isOpen,
  uuidCount,
  trackEvent,
}) => {
  const {
    successfulCancellationToast: { displayToastForApprovalCancellation },
  } = useContext(BudgetDetailPageContext);
  const intl = useIntl();

  const cancelButtonLabel = uuidCount > 1
    ? intl.formatMessage({
      id: 'lcm.budget.detail.page.approved.requests.cancel.approval.modal.cancel.multiple.approvals.button',
      defaultMessage: 'Cancel approvals ({uuidCount})',
      description: 'Button text for canceling approvals in bulk',
    }, { uuidCount })
    : intl.formatMessage({
      id: 'lcm.budget.detail.page.approved.requests.cancel.approval.modal.cancel.approval.button',
      defaultMessage: 'Cancel approval',
      description: 'Button text for canceling approval',
    });

  const handleOnClick = async () => {
    try {
      await cancelApprovedRequest();
      trackEvent();
      // Only show toast on successful cancellation
      displayToastForApprovalCancellation(uuidCount);
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
      title="Cancel approval dialog"
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage
            id="lcm.budget.detail.page.approved.requests.cancel.approval.modal.title"
            defaultMessage="Cancel approval?"
            description="Title for the cancel approval modal"
          />
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.approved.requests.cancel.approval.modal.body"
            defaultMessage="This action cannot be undone."
            description="Body text for the cancel approval modal which warns the user that the action cannot be undone."
          />
        </p>
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.approved.requests.cancel.approval.modal.body2"
            defaultMessage="The learner will be notified that their approved request has been canceled. The funds associated with this request will move from 'pending' back to 'available'."
            description="Body text for the cancel approval modal which informs the user that the learner will be notified that the approval has been canceled."
          />
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage
              id="lcm.budget.detail.page.approved.requests.cancel.approval.modal.go.back.button"
              defaultMessage="Go back"
              description="Go back button text for the cancel approval modal"
            />
          </ModalDialog.CloseButton>
          <StatefulButton
            iconBefore={cancelButtonState === 'default' ? DoNotDisturbOn : null}
            labels={{
              default: cancelButtonLabel,
              pending: intl.formatMessage({
                id: 'lcm.budget.detail.page.approved.requests.cancel.approval.modal.canceling.state',
                defaultMessage: 'Canceling...',
                description: 'Button state text for canceling approval',
              }),
              complete: intl.formatMessage({
                id: 'lcm.budget.detail.page.approved.requests.cancel.approval.modal.canceled.state',
                defaultMessage: 'Canceled',
                description: 'Button state text for canceled approval',
              }),
              error: intl.formatMessage({
                id: 'lcm.budget.detail.page.approved.requests.cancel.approval.modal.try.again',
                defaultMessage: 'Try again',
                description: 'Button state text for trying to cancel approval again',
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

CancelApprovedRequestModal.propTypes = {
  cancelButtonState: PropTypes.string.isRequired,
  cancelApprovedRequest: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  uuidCount: PropTypes.number,
  trackEvent: PropTypes.func.isRequired,
};

CancelApprovedRequestModal.defaultProps = {
  uuidCount: 1,
};

export default CancelApprovedRequestModal;
