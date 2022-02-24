import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button, Form, Alert, StatefulButton,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

const DeclineSubsidyRequestModal = ({
  isOpen,
  isLoading,
  onDecline,
  onClose,
  error,
}) => {
  const [shouldNotifyLearner, setShouldNotifyLearner] = useState(false);

  const buttonState = useMemo(() => {
    if (error) {
      return 'errored';
    }

    if (isLoading) {
      return 'pending';
    }

    return 'default';
  }, [error, isLoading]);

  return (
    <ModalDialog
      className="subsidy-request-modal"
      title="Decline Subsidy Request"
      isOpen={isOpen}
      hasCloseButton
      onClose={onClose}
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
        <Form.Checkbox
          className="py-3"
          data-testid="decline-subsidy-request-modal-notify-learner-checkbox"
          checked={shouldNotifyLearner}
          onChange={(e) => setShouldNotifyLearner(e.target.checked)}
        >
          Send the learner an email notification
        </Form.Checkbox>
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
            onClick={() => onDecline(shouldNotifyLearner)}
            data-testid="decline-subsidy-request-modal-decline-btn"
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

DeclineSubsidyRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onDecline: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Error),
};

DeclineSubsidyRequestModal.defaultProps = {
  error: undefined,
};

export default DeclineSubsidyRequestModal;
