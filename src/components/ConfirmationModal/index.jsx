import React from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button, StatefulButton, Alert,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

export const DEFAULT_TITLE = 'Are you sure?';

const CONFIRM_TEXT = 'Confirm';
const CANCEL_TEXT = 'Cancel';
const LOADING_TEXT = 'Loading...';
const TRY_AGAIN_TEXT = 'Try again';

export const CONFIRM_BUTTON_STATES = {
  default: 'default',
  pending: 'pending',
  errored: 'errored',
};

const messages = defineMessages({
  [DEFAULT_TITLE]: {
    id: 'adminPortal.confirmationModal.defaultTitle',
    defaultMessage: 'Are you sure?',
    description: 'Default title for the confirmation modal',
  },
  [CONFIRM_TEXT]: {
    id: 'adminPortal.confirmationModal.confirm',
    defaultMessage: 'Confirm',
    description: 'Confirm button text for the confirmation modal',
  },
  [CANCEL_TEXT]: {
    id: 'adminPortal.confirmationModal.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button text for the confirmation modal',
  },
  [LOADING_TEXT]: {
    id: 'adminPortal.confirmationModal.loading',
    defaultMessage: 'Loading...',
    description: 'Loading state text for the confirmation modal',
  },
  [TRY_AGAIN_TEXT]: {
    id: 'adminPortal.confirmationModal.tryAgain',
    defaultMessage: 'Try again',
    description: 'Try again button text for the confirmation modal',
  },
});

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
}) => {
  const intl = useIntl();
  const defaultMessage = confirmButtonLabels[CONFIRM_BUTTON_STATES.default];
  const pendingMessage = confirmButtonLabels[CONFIRM_BUTTON_STATES.pending];
  const erroredMessage = confirmButtonLabels[CONFIRM_BUTTON_STATES.errored];

  // This code snippet first checks if the message exists in the messages object, and if it does,
  // it formats the message using the intl.formatMessage function. If the message does not exist,
  // it uses the defaultMessage value.
  const translatedConfirmButtonLabels = {
    [CONFIRM_BUTTON_STATES.default]:
      messages[defaultMessage] ? intl.formatMessage(messages[defaultMessage]) : defaultMessage,
    [CONFIRM_BUTTON_STATES.pending]:
      messages[pendingMessage] ? intl.formatMessage(messages[pendingMessage]) : pendingMessage,
    [CONFIRM_BUTTON_STATES.errored]:
      messages[erroredMessage] ? intl.formatMessage(messages[erroredMessage]) : erroredMessage,
  };

  return (
    <ModalDialog
      title="Confirmation Modal"
      variant="default"
      isOpen={isOpen}
      onClose={onClose}
      {...rest}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {messages[title] ? intl.formatMessage(messages[title]) : title}
        </ModalDialog.Title>
        {confirmButtonState === CONFIRM_BUTTON_STATES.errored && (
          <Alert
            icon={Info}
            variant="danger"
          >
            <Alert.Heading>
              <FormattedMessage
                id="confirmationModal.error"
                defaultMessage="Something went wrong"
                description="Error message for the confirmation modal"
              />
            </Alert.Heading>
            <FormattedMessage
              id="confirmationModal.errorDescription"
              defaultMessage="Please try again."
              description="Error description for the confirmation modal"
            />
          </Alert>
        )}
      </ModalDialog.Header>
      <ModalDialog.Body>
        {body}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button onClick={onClose} variant="outline-primary">
            {messages[cancelText] ? intl.formatMessage(messages[cancelText]) : cancelText}
          </Button>
          <StatefulButton
            labels={translatedConfirmButtonLabels}
            state={confirmButtonState}
            variant="primary"
            disabled={disabled}
            onClick={onConfirm}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

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
    [CONFIRM_BUTTON_STATES.default]: CONFIRM_TEXT,
    [CONFIRM_BUTTON_STATES.pending]: LOADING_TEXT,
    [CONFIRM_BUTTON_STATES.errored]: TRY_AGAIN_TEXT,
  },
  confirmButtonState: CONFIRM_BUTTON_STATES.default,
  title: DEFAULT_TITLE,
  confirmText: CONFIRM_TEXT,
  cancelText: CANCEL_TEXT,
};

export default ConfirmationModal;
