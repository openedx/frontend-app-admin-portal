import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Alert, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { Check, Info } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';

const BulkApproveBnrRequestModal = ({
  approveButtonState,
  approveBnrRequests,
  close,
  isOpen,
  onRefresh,
  requestCount,
}) => {
  const intl = useIntl();
  const [error, setError] = useState(null);
  const {
    successfulBulkApprovalToast: { displayToastForBulkApproval },
  } = useContext(BudgetDetailPageContext);

  const handleOnClick = async () => {
    setError(null);
    try {
      await approveBnrRequests();
      displayToastForBulkApproval(requestCount);
      if (onRefresh) {
        onRefresh();
      }
      close();
    } catch (err) {
      setError(err);
    }
  };

  const handleClose = () => {
    setError(null);
    close();
  };

  return (
    <ModalDialog
      hasCloseButton
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk approve requests"
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage
            id="lcm.budget.detail.page.requests.tab.bulk.approve.modal.title"
            defaultMessage="Approve enrollment {requestCount, plural, one {request} other {requests}}?"
            description="Title for the bulk approve requests modal"
            values={{ requestCount }}
          />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {error && (
          <Alert
            icon={Info}
            variant="danger"
            data-testid="bulk-approve-request-modal-alert"
          >
            <Alert.Heading>
              <FormattedMessage
                id="lcm.budget.detail.page.requests.tab.bulk.approve.modal.error.heading"
                defaultMessage="Something went wrong"
                description="Error heading for the bulk approve requests modal"
              />
            </Alert.Heading>
            <FormattedMessage
              id="lcm.budget.detail.page.requests.tab.bulk.approve.modal.error.body"
              defaultMessage="Please try again."
              description="Error message for the bulk approve requests modal"
            />
          </Alert>
        )}
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.requests.tab.bulk.approve.modal.body"
            defaultMessage="Approving {requestCount, plural, one {an enrollment request} other {enrollment requests}} cannot be undone. The funds from {requestCount, plural, one {the request} other {the requests}} will be earmarked in your budget until the {requestCount, plural, one {learner completes} other {learners complete}} enrollment."
            description="Body text for the bulk approve requests modal"
            values={{ requestCount }}
          />
        </p>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage
              id="lcm.budget.detail.page.requests.tab.bulk.approve.modal.cancel"
              defaultMessage="Cancel"
              description="Cancel button text for the bulk approve requests modal"
            />
          </ModalDialog.CloseButton>
          <StatefulButton
            iconBefore={approveButtonState === 'default' ? Check : null}
            labels={{
              default: requestCount > 1
                ? intl.formatMessage({
                  id: 'lcm.budget.detail.page.requests.tab.bulk.approve.modal.approve.multiple',
                  defaultMessage: 'Approve ({requestCount, number})',
                  description: 'Button text to approve multiple requests',
                }, { requestCount })
                : intl.formatMessage({
                  id: 'lcm.budget.detail.page.requests.tab.bulk.approve.modal.approve.single',
                  defaultMessage: 'Approve',
                  description: 'Button text to approve a single request',
                }),
              pending: intl.formatMessage({
                id: 'lcm.budget.detail.page.requests.tab.bulk.approve.modal.approving',
                defaultMessage: 'Approving...',
                description: 'Button text while approving requests',
              }),
              complete: intl.formatMessage({
                id: 'lcm.budget.detail.page.requests.tab.bulk.approve.modal.approved',
                defaultMessage: 'Approved',
                description: 'Button text when requests have been approved',
              }),
              error: intl.formatMessage({
                id: 'lcm.budget.detail.page.requests.tab.bulk.approve.modal.error',
                defaultMessage: 'Try again',
                description: 'Button text when approval has failed',
              }),
            }}
            variant="primary"
            state={approveButtonState}
            onClick={handleOnClick}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

BulkApproveBnrRequestModal.defaultProps = {
  onRefresh: undefined,
};
BulkApproveBnrRequestModal.propTypes = {
  approveButtonState: PropTypes.string.isRequired,
  approveBnrRequests: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  requestCount: PropTypes.number.isRequired,
  onRefresh: PropTypes.func,
};

export default BulkApproveBnrRequestModal;
