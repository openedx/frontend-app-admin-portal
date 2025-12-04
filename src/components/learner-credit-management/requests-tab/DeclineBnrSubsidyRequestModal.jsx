import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button, Form, Alert, StatefulButton,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';

const DeclineBnrSubsidyRequestModal = ({
  isOpen,
  subsidyRequest: {
    uuid,
  },
  enterpriseId,
  declineRequestFn,
  onSuccess,
  onClose,
}) => {
  const [declineReason, setDeclineReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const buttonState = useMemo(() => {
    if (error) {
      return 'errored';
    }

    if (isLoading) {
      return 'pending';
    }

    return 'default';
  }, [error, isLoading]);

  const declineSubsidyRequest = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);
    try {
      await declineRequestFn({
        enterpriseId,
        subsidyRequestUUID: uuid,
        sendNotification: true, // always true as it would be by default
        declineReason, // include the reason field
      });
      onSuccess();
    } catch (err) {
      logError(err);
      setError(err);
      setIsLoading(false);
    }
  }, [
    uuid,
    declineReason,
    declineRequestFn,
    onSuccess,
    enterpriseId,
  ]);

  return (
    <ModalDialog
      className="subsidy-request-modal"
      title="Decline Subsidy Request"
      isOpen={isOpen}
      hasCloseButton
      onClose={onClose}
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          Are you sure?
        </ModalDialog.Title>
        {error && (
          <Alert
            icon={Info}
            variant="danger"
            data-testid="decline-subsidy-request-modal-alert"
          >
            <Alert.Heading>Something went wrong</Alert.Heading>
            Please try again.
          </Alert>
        )}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p>
          Declining an enrollment request cannot be undone. If you change your mind, the learner will have to
          submit a new enrollment request.
        </p>
        {/* Reason input with character count + 250 limit */}
        <Form.Group className="mt-3">
          <Form.Control
            as="textarea"
            rows={2}
            maxLength={250} // Max Character limit
            placeholder="Reason for declining"
            data-testid="decline-subsidy-request-reason-input"
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
          <Button variant="tertiary" onClick={onClose} data-testid="decline-subsidy-request-modal-close-btn">
            Close
          </Button>
          <StatefulButton
            state={buttonState}
            variant="primary"
            labels={{
              default: 'Decline',
              pending: 'Declining...',
              errored: 'Try again',
            }}
            onClick={declineSubsidyRequest}
            disabled={isLoading}
            data-testid="decline-subsidy-request-modal-decline-btn"
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

DeclineBnrSubsidyRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  subsidyRequest: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
  declineRequestFn: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DeclineBnrSubsidyRequestModal;
