import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Badge,
  Button,
  Form,
  ModalDialog,
  StatefulButton,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import LmsApiService from '../../data/services/LmsApiService';

const MAX_EMAIL_INVITES = 10;

const AddAdminModal = ({
  isOpen, onClose, enterpriseId, onSuccess,
}) => {
  const intl = useIntl();
  const [emailInput, setEmailInput] = useState('');
  const [buttonState, setButtonState] = useState('default');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const closeTimeoutRef = useRef(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  useEffect(() => () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const parseEmails = (input) => input
    .split(/\n+/)
    .map(email => email.trim())
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

    return [...duplicates];
  };

  const handleClose = () => {
    clearCloseTimeout();
    setEmailInput('');
    setButtonState('default');
    setErrorMessage('');
    setSuccessMessage('');
    onClose();
  };

  const handleInvite = async () => {
    if (buttonState === 'pending' || buttonState === 'complete') {
      return;
    }

    const emails = parseEmails(emailInput);

    if (emails.length === 0) {
      setErrorMessage(
        intl.formatMessage({
          id: 'adminPortal.peopleManagement.addAdmin.modal.error.noEmail',
          defaultMessage: 'Please add at least one email address.',
          description: 'Error message when no email is entered',
        }),
      );
      return;
    }

    if (emails.length > MAX_EMAIL_INVITES) {
      const extraCount = emails.length - MAX_EMAIL_INVITES;
      setErrorMessage(
        intl.formatMessage({
          id: 'adminPortal.peopleManagement.addAdmin.modal.error.tooManyEmails',
          defaultMessage: '{enteredCount} emails entered ({maxCount} maximum). Delete {extraCount} {extraCount, plural, one {email} other {emails}} to proceed.',
          description: 'Error message when more than maximum emails are entered',
        }, {
          enteredCount: emails.length,
          maxCount: MAX_EMAIL_INVITES,
          extraCount,
        }),
      );
      return;
    }

    const invalidEmails = emails.filter(email => !validateEmail(email));
    if (invalidEmails.length > 0) {
      setErrorMessage(
        intl.formatMessage({
          id: 'adminPortal.peopleManagement.addAdmin.modal.error.invalidEmail',
          defaultMessage: '{email} is not a valid email.',
          description: 'Error message when an invalid email is entered',
        }, {
          email: invalidEmails[0],
        }),
      );
      return;
    }

    const duplicateEmails = getDuplicateEmails(emails);
    if (duplicateEmails.length > 0) {
      const [firstDuplicate] = duplicateEmails;
      const otherCount = duplicateEmails.length - 1;

      setErrorMessage(
        intl.formatMessage({
          id: 'adminPortal.peopleManagement.addAdmin.modal.error.duplicateEmails',
          defaultMessage: '{email}{otherCount, plural, =0 { was entered more than once.} one { and # other email address was entered more than once.} other { and # other email addresses were entered more than once.}}',
          description: 'Error message when duplicate emails are entered',
        }, {
          email: firstDuplicate,
          otherCount,
        }),
      );
      return;
    }

    try {
      setButtonState('pending');
      setErrorMessage('');

      const response = await LmsApiService.inviteEnterpriseAdmin(enterpriseId, { emails });

      setButtonState('complete');
      setSuccessMessage(response?.data || response);

      clearCloseTimeout();
      closeTimeoutRef.current = setTimeout(() => {
        onSuccess(response);
        handleClose();
      }, 3000);
    } catch (error) {
      logError(error);
      setButtonState('error');
      setErrorMessage(
        error.message || intl.formatMessage({
          id: 'adminPortal.peopleManagement.addAdmin.modal.error.inviteFailed',
          defaultMessage: 'Failed to invite admins.',
          description: 'Error message when admin invitation fails',
        }),
      );
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
        {successMessage ? (
          <div>
            <div className="alert alert-success mb-3" role="alert">
              <strong>
                <FormattedMessage
                  id="adminPortal.peopleManagement.addAdmin.modal.successTitle"
                  defaultMessage="Invitation Results"
                  description="Title for success results"
                />
              </strong>
            </div>
            {Array.isArray(successMessage) && successMessage.length > 0 ? (
              <div className="list-group">
                {successMessage.map((result) => (
                  <div key={result.email} className="list-group-item d-flex justify-content-between align-items-center">
                    <span className="text-break">{result.email}</span>
                    <Badge variant={result.status === 'invite sent' ? 'success' : 'light'}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-success" role="alert">
                <FormattedMessage
                  id="adminPortal.peopleManagement.addAdmin.modal.successMessage"
                  defaultMessage="Admins invited successfully!"
                  description="Success message after admins are invited"
                />
              </div>
            )}
          </div>
        ) : (
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
                setEmailInput(e.target.value);
                setErrorMessage('');
              }}
              placeholder=""
              isInvalid={!!errorMessage}
            />
            {errorMessage && (
              <Form.Control.Feedback type="invalid">
                {errorMessage}
              </Form.Control.Feedback>
            )}
            <Form.Text className="text-muted small mt-2">
              <FormattedMessage
                id="adminPortal.peopleManagement.addAdmin.modal.helperText"
                defaultMessage="Maximum invite at a time: 10 emails. To add more than one member, enter one email address per line."
                description="Helper text for email input"
              />
            </Form.Text>
          </Form.Group>
        )}
      </ModalDialog.Body>

      {!successMessage && (
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
      )}
    </ModalDialog>
  );
};

AddAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default AddAdminModal;
