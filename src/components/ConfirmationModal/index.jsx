import React from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button, StatefulButton, Alert,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

export const DEFAULT_TITLE = 'Are you sure?';
export const CONFIRM_BUTTON_STATES = {
  default: 'default',
  pending: 'pending',
  errored: 'errored',
};

const ConfirmationModal = ({
  isOpen,
  disabled,
  confirmButtonLabels,
  confirmButtonState,
  onConfirm,
  onClose,
  title,
  body,
  confirmText,
  cancelText,
  ...rest
}) => (
  <ModalDialog
    title="Confirmation Modal"
    variant="default"
    isOpen={isOpen}
    onClose={onClose}
    {...rest}
  >
    <ModalDialog.Header>
      <ModalDialog.Title>
        {title}
      </ModalDialog.Title>
      {confirmButtonState === CONFIRM_BUTTON_STATES.errored && (
        <Alert
          icon={Info}
          variant="danger"
        >
          <Alert.Heading>
            Something went wrong
          </Alert.Heading>
          Please try again.
        </Alert>
      )}
    </ModalDialog.Header>
    <ModalDialog.Body>
      {body}
    </ModalDialog.Body>
    <ModalDialog.Footer>
      <ActionRow>
        <Button onClick={onClose} variant="outline-primary">
          {cancelText}
        </Button>
        <StatefulButton
          labels={confirmButtonLabels}
          state={confirmButtonState}
          variant="primary"
          disabled={disabled}
          onClick={onConfirm}
        />
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  confirmButtonLabels: PropTypes.shape({
    default: PropTypes.string,
    pending: PropTypes.string,
    errored: PropTypes.string,
  }),
  confirmButtonState: PropTypes.oneOf(Object.values(CONFIRM_BUTTON_STATES)),
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  body: PropTypes.node.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

ConfirmationModal.defaultProps = {
  disabled: false,
  confirmButtonLabels: {
    [CONFIRM_BUTTON_STATES.default]: 'Confirm',
    [CONFIRM_BUTTON_STATES.pending]: 'Loading...',
    [CONFIRM_BUTTON_STATES.errored]: 'Try again',
  },
  confirmButtonState: CONFIRM_BUTTON_STATES.default,
  title: DEFAULT_TITLE,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

export default ConfirmationModal;
