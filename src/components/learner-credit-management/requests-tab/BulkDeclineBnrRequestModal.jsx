import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Alert, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { DoNotDisturbOn, Info } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';

const BulkDeclineBnrRequestModal = ({
  declineButtonState,
  declineBnrRequests,
  close,
  isOpen,
  onRefresh,
  requestCount,
}) => {
  const intl = useIntl();
  const [error, setError] = useState(null);
  const {
    successfulBulkDeclineToast: { displayToastForBulkDecline },
  } = useContext(BudgetDetailPageContext);

  const handleOnClick = async () => {
    setError(null);
    try {
      await declineBnrRequests();
      displayToastForBulkDecline(requestCount);
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
      title="Bulk decline requests"
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage
            id="lcm.budget.detail.page.requests.tab.bulk.decline.modal.title"
            defaultMessage="Decline enrollment {requestCount, plural, one {request} other {requests}}?"
            description="Title for the bulk decline requests modal"
            values={{ requestCount }}
          />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {error && (
          <Alert
            icon={Info}
            variant="danger"
            data-testid="bulk-decline-request-modal-alert"
          >
            <Alert.Heading>
              <FormattedMessage
                id="lcm.budget.detail.page.requests.tab.bulk.decline.modal.error.heading"
                defaultMessage="Something went wrong"
                description="Error heading for the bulk decline requests modal"
              />
            </Alert.Heading>
            <FormattedMessage
              id="lcm.budget.detail.page.requests.tab.bulk.decline.modal.error.body"
              defaultMessage="Please try again."
              description="Error message for the bulk decline requests modal"
            />
          </Alert>
        )}
        <p>
          <FormattedMessage
            id="lcm.budget.detail.page.requests.tab.bulk.decline.modal.body"
            defaultMessage="Declining {requestCount, plural, one {an enrollment request} other {enrollment requests}} cannot be undone. If you change your mind, {requestCount, plural, one {the learner} other {learners}} will have to submit a new enrollment request."
            description="Body text for the bulk decline requests modal"
            values={{ requestCount }}
          />
        </p>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage
              id="lcm.budget.detail.page.requests.tab.bulk.decline.modal.cancel"
              defaultMessage="Cancel"
              description="Cancel button text for the bulk decline requests modal"
            />
          </ModalDialog.CloseButton>
          <StatefulButton
            iconBefore={declineButtonState === 'default' ? DoNotDisturbOn : null}
            labels={{
              default: requestCount > 1
                ? intl.formatMessage({
                  id: 'lcm.budget.detail.page.requests.tab.bulk.decline.modal.decline.multiple',
                  defaultMessage: 'Decline ({requestCount, number})',
                  description: 'Button text to decline multiple requests',
                }, { requestCount })
                : intl.formatMessage({
                  id: 'lcm.budget.detail.page.requests.tab.bulk.decline.modal.decline.single',
                  defaultMessage: 'Decline',
                  description: 'Button text to decline a single request',
                }),
              pending: intl.formatMessage({
                id: 'lcm.budget.detail.page.requests.tab.bulk.decline.modal.declining',
                defaultMessage: 'Declining...',
                description: 'Button text while declining requests',
              }),
              complete: intl.formatMessage({
                id: 'lcm.budget.detail.page.requests.tab.bulk.decline.modal.declined',
                defaultMessage: 'Declined',
                description: 'Button text when requests have been declined',
              }),
              error: intl.formatMessage({
                id: 'lcm.budget.detail.page.requests.tab.bulk.decline.modal.error',
                defaultMessage: 'Try again',
                description: 'Button text when decline has failed',
              }),
            }}
            variant="primary"
            state={declineButtonState}
            onClick={handleOnClick}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

BulkDeclineBnrRequestModal.defaultProps = {
  onRefresh: undefined,
};
BulkDeclineBnrRequestModal.propTypes = {
  declineButtonState: PropTypes.string.isRequired,
  declineBnrRequests: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  requestCount: PropTypes.number.isRequired,
  onRefresh: PropTypes.func,
};

export default BulkDeclineBnrRequestModal;
