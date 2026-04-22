import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  Form,
  ModalDialog,
  StatefulButton,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import LmsApiService from '../../data/services/LmsApiService';
import { isInviteEmailAddressesInputValueValid } from '../learner-credit-management/cards/data';
import { isEmail, makePlural } from '../../utils';

const MAX_EMAIL_INVITES = 10;

const AddAdminModal = ({
  isOpen, onClose, enterpriseId, onSuccess, onError,
}) => {
  const intl = useIntl();
  const [emailInput, setEmailInput] = useState('');
  const [buttonState, setButtonState] = useState('default');
  const [errorMessage, setErrorMessage] = useState('');

  const parseEmails = (input) => input
    .split(/\n+/)
    .filter(email => email.length > 0);

  const getDuplicateEmails = (emails) => {
    const seen = new Set();
    const duplicates = new Set();

    emails.forEach((email) => {
      const normalized = email.toLowerCase();
      if (seen.has(normalized)) {
        duplicates.add(normalized);
      } else {
        seen.add(normalized);
      }
    });

    return Array.from(duplicates);
  };

  const getValidationError = (emails) => {
    if (emails.length > MAX_EMAIL_INVITES) {
      const extraCount = emails.length - MAX_EMAIL_INVITES;
      return `${emails.length} emails entered (${MAX_EMAIL_INVITES} maximum). Delete ${makePlural(extraCount, 'email')} to proceed.`;
    }

    const emailWithSpaces = emails.find(email => email !== email.trim());
    if (emailWithSpaces) {
      return `${emailWithSpaces} is not a valid email.`;
    }

    const trimmedEmails = emails.map(email => email.trim());

    const invalidEmail = trimmedEmails.find(email => email && !isEmail(email));
    if (invalidEmail) {
      return `${invalidEmail} is not a valid email.`;
    }

    const duplicateEmails = getDuplicateEmails(trimmedEmails);

    if (duplicateEmails.length > 0) {
      const [firstDuplicate] = duplicateEmails;
      const otherCount = duplicateEmails.length - 1;

      return intl.formatMessage(
        {
          id: 'adminPortal.peopleManagement.addAdmin.modal.error.duplicateEmails',
          defaultMessage:
            '{email}{otherCount, plural, =0 { was entered more than once.} one { and # other email address were entered more than once.} other { and # other email addresses were entered more than once.}}',
          description: 'Error message when duplicate emails are entered',
        },
        {
          email: firstDuplicate,
          otherCount,
        },
      );
    }

    const { validationError } = isInviteEmailAddressesInputValueValid({
      learnerEmails: trimmedEmails,
    });

    return validationError?.message || '';
  };

  const handleClose = () => {
    setEmailInput('');
    setButtonState('default');
    setErrorMessage('');
    onClose();
  };

  const handleInvite = async () => {
    if (buttonState === 'pending' || buttonState === 'complete') {
      return;
    }

    const emails = parseEmails(emailInput);
    const trimmedEmails = emails.map(email => email.trim());

    try {
      setButtonState('pending');
      setErrorMessage('');

      const response = await LmsApiService.inviteEnterpriseAdmin(
        enterpriseId,
        { emails: trimmedEmails },
      );

      onSuccess(response);
      handleClose();
    } catch (err) {
      logError(err);
      onError?.(err);
      handleClose();
    }
  };

  return (
    <ModalDialog
      title={intl.formatMessage({
        id: 'adminPortal.peopleManagement.addAdmin.modal.title',
        defaultMessage: 'Invite Admins',
        description: 'Title for add admin modal',
      })}
      isOpen={isOpen}
      onClose={handleClose}
      hasCloseButton
      size="md"
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage
            id="adminPortal.peopleManagement.addAdmin.modal.title"
            defaultMessage="Invite Admins"
            description="Title for add admin modal"
          />
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <Form.Group controlId="add-admin-email-input">
          <Form.Label>
            <FormattedMessage
              id="adminPortal.peopleManagement.addAdmin.modal.emailLabel"
              defaultMessage="Enter email address"
              description="Label for email input in add admin modal"
            />
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={emailInput}
            onChange={(e) => {
              const newValue = e.target.value;
              setEmailInput(newValue);

              if (!newValue.trim()) {
                setErrorMessage('');
                return;
              }

              const emails = parseEmails(newValue);
              const error = getValidationError(emails);
              setErrorMessage(error);
            }}
            placeholder=""
            isInvalid={!!errorMessage}
          />
          {errorMessage ? (
            <Form.Control.Feedback type="invalid">
              {errorMessage}
            </Form.Control.Feedback>
          ) : (
            <Form.Control.Feedback>
              <p className="mb-0">
                <FormattedMessage
                  id="adminPortal.peopleManagement.addAdmin.modal.helperText.maxCount"
                  defaultMessage="Maximum invite at a time: {maxCount} emails"
                  description="Helper text showing maximum email limit"
                  values={{ maxCount: MAX_EMAIL_INVITES }}
                />
              </p>
              <p>
                <FormattedMessage
                  id="adminPortal.peopleManagement.addAdmin.modal.helperText.perLine"
                  defaultMessage="To add more than one member, enter one email address per line."
                  description="Helper text for entering multiple emails"
                />
              </p>
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="tertiary" onClick={handleClose}>
            <FormattedMessage
              id="adminPortal.peopleManagement.addAdmin.modal.cancel"
              defaultMessage="Cancel"
              description="Cancel button text"
            />
          </Button>
          <StatefulButton
            state={buttonState}
            disabled={!emailInput.trim() || !!errorMessage}
            disabledStates={['pending', 'complete']}
            labels={{
              default: intl.formatMessage({
                id: 'adminPortal.peopleManagement.addAdmin.modal.submit',
                defaultMessage: 'Invite',
                description: 'Submit button text',
              }),
              pending: intl.formatMessage({
                id: 'adminPortal.peopleManagement.addAdmin.modal.submitting',
                defaultMessage: 'Inviting...',
                description: 'Submitting button text',
              }),
              complete: intl.formatMessage({
                id: 'adminPortal.peopleManagement.addAdmin.modal.success',
                defaultMessage: 'Invited!',
                description: 'Success button text',
              }),
              error: intl.formatMessage({
                id: 'adminPortal.peopleManagement.addAdmin.modal.error',
                defaultMessage: 'Try again',
                description: 'Error button text',
              }),
            }}
            onClick={handleInvite}
            variant="primary"
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

AddAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func,
};

AddAdminModal.defaultProps = {
  onError: undefined,
};

export default AddAdminModal;
