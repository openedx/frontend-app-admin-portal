import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button, Form, Alert,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

const DeclineSubsidyRequestModal = ({
  isOpen,
  onDeny,
  onClose,
  error,
}) => {
  const [shouldNotifyLearner, setShouldNotifyLearner] = useState(false);
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
          >
            <Alert.Heading>Something went wrong</Alert.Heading>
            We weren’t able to process your request to decline enrollment. Please try again.
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
          checked={shouldNotifyLearner}
          onChange={(e) => setShouldNotifyLearner(e.target.checked)}
        >
          Send the learner an email notification
        </Form.Checkbox>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="outline-primary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={onDeny}>
            Decline
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

DeclineSubsidyRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onDeny: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Error),
};

DeclineSubsidyRequestModal.defaultProps = {
  error: undefined,
};

export default DeclineSubsidyRequestModal;
