import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button, Alert, StatefulButton,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';

const ApproveBnrSubsidyRequestModal = ({
  isOpen,
  subsidyRequest: {
    uuid,
  },
  enterpriseId,
  subsidyAccessPolicyId,
  approveRequestFn,
  onSuccess,
  onClose,
}) => {
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

  const approveSubsidyRequest = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);
    try {
      await approveRequestFn({
        enterpriseId,
        subsidyAccessPolicyId,
        subsidyRequestUUIDs: [uuid],
      });
      onSuccess();
    } catch (err) {
      logError(err);
      setError(err);
      setIsLoading(false);
    }
  }, [
    uuid,
    approveRequestFn,
    onSuccess,
    enterpriseId,
    subsidyAccessPolicyId,
  ]);

  return (
    <ModalDialog
      className="subsidy-request-modal"
      title="Approve Subsidy Request"
      isOpen={isOpen}
      hasCloseButton
      onClose={onClose}
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          Approve enrollment request?
        </ModalDialog.Title>
        {error && (
          <Alert
            icon={Info}
            variant="danger"
            data-testid="approve-subsidy-request-modal-alert"
          >
            <Alert.Heading>Something went wrong</Alert.Heading>
            Please try again.
          </Alert>
        )}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p>
          Approving an enrollment request cannot be undone.
          The funds from the request will be earmarked in your budget until the learner completes enrollment.
        </p>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="tertiary" onClick={onClose} data-testid="approve-subsidy-request-modal-close-btn">
            Cancel
          </Button>
          <StatefulButton
            state={buttonState}
            variant="primary"
            labels={{
              default: 'Approve',
              pending: 'Approving...',
              errored: 'Try again',
            }}
            onClick={approveSubsidyRequest}
            disabled={isLoading}
            data-testid="approve-subsidy-request-modal-approve-btn"
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

ApproveBnrSubsidyRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  subsidyRequest: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
  subsidyAccessPolicyId: PropTypes.string.isRequired,
  approveRequestFn: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ApproveBnrSubsidyRequestModal;
