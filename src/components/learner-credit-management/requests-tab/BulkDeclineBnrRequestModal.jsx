import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Alert, Form, ModalDialog, StatefulButton,
} from '@openedx/paragon';
import { DoNotDisturbOn, Info } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';

const BulkDeclineBnrRequestModal = ({
  declineButtonState,
  declineBnrRequests,
  close,
  isOpen,
  requestCount,
}) => {
  const intl = useIntl();
  const [error, setError] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const {
    successfulBulkDeclineToast: { displayToastForBulkDecline },
  } = useContext(BudgetDetailPageContext);

  const handleOnClick = async () => {
    setError(null);
    try {
      await declineBnrRequests(declineReason);
      displayToastForBulkDecline(requestCount);
      close();
    } catch (err) {
      setError(err);
    }
  };

  const handleClose = () => {
    setError(null);
    setDeclineReason('');
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
            defaultMessage="Declining {requestCount, plural, one {an enrollment request} other {enrollment requests}} cannot be undone. If you change your mind, the {requestCount, plural, one {learner} other {learners}} will have to submit {requestCount, plural, one {a new enrollment request} other {new enrollment requests}}."
            description="Body text for the bulk decline requests modal"
            values={{ requestCount }}
          />
        </p>
        <Form.Group className="mt-3">
          <Form.Control
            as="textarea"
            rows={2}
            maxLength={250}
            placeholder={intl.formatMessage({
              id: 'lcm.budget.detail.page.requests.tab.bulk.decline.modal.reason.placeholder',
              defaultMessage: 'Reason for declining',
              description: 'Placeholder text for the decline reason input',
            })}
            data-testid="bulk-decline-request-reason-input"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
          <div className="text-right text-muted mt-1" style={{ fontSize: '0.85rem' }}>
            {declineReason.length}/250 characters
          </div>
        </Form.Group>
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

BulkDeclineBnrRequestModal.propTypes = {
  declineButtonState: PropTypes.string.isRequired,
  declineBnrRequests: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  requestCount: PropTypes.number.isRequired,
};

export default BulkDeclineBnrRequestModal;
