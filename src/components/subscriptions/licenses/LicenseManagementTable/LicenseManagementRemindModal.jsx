import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  StatefulButton,
  ModalDialog,
  ActionRow,
  Spinner,
  Form,
  Hyperlink,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import { validateEmailTemplateForm } from '../../../../data/validation/email';
import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import { configuration } from '../../../../config';

const defaultEmailTemplate = {
  greeting: 'We noticed you haven’t had a chance to start learning on edX!  It’s easy to get started and browse the course catalog.',
  body: '{ENTERPRISE_NAME} partnered with edX to give everyone access to high-quality online courses. '
    + 'Start your subscription and browse courses in nearly every subject including '
    + 'Data Analytics, Digital Media, Business & Leadership, Communications, Computer Science and so much more. '
    + 'Courses are taught by experts from the world’s leading universities and corporations.'
    + '\n\nStart learning: {LICENSE_ACTIVATION_LINK}',
  closing: 'To learn more about your unlimited subscription and edX, contact your edX administrator',
};

const initialRequestState = {
  error: undefined,
  loading: false,
};

const LicenseManagementRemindModal = ({
  isOpen,
  onClose,
  onSuccess,
  subscription,
  usersToRemind,
}) => {
  const [requestState, setRequestState] = useState(initialRequestState);

  const [emailTemplate, setEmailTemplate] = useState(defaultEmailTemplate);

  const numberToRemind = usersToRemind.length;
  const title = `Remind User${numberToRemind > 1 ? '' : 's'}`;

  const handleSubmit = () => {
    setRequestState({ ...initialRequestState, loading: true });
    try {
      validateEmailTemplateForm(emailTemplate, 'body', false);
    } catch (error) {
      logError(error);
      setRequestState({ ...initialRequestState, error });
      return;
    }

    const userEmailsToRemind = usersToRemind.map((user) => user.email);

    const options = {
      greeting: emailTemplate.greeting,
      closing: emailTemplate.closing,
      user_emails: userEmailsToRemind,
    };

    LicenseManagerApiService.licenseRemind(options, subscription.uuid, false)
      .then((response) => {
        setRequestState(initialRequestState);
        onSuccess(response);
      })
      .catch((error) => {
        logError(error);
        setRequestState({ ...initialRequestState, error });
      });
  };

  const handleClose = () => {
    if (!requestState.loading) {
      onClose();
    }
  };

  const getRemindButtonState = () => {
    if (requestState.error) {
      return 'error';
    }
    if (requestState.loading) {
      return 'pending';
    }
    return 'default';
  };

  return (
    <ModalDialog
      title={title}
      isOpen={isOpen}
      onClose={handleClose}
      hasCloseButton={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {title}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {requestState.error
            && (
            <Alert variant="danger">
              <p>There was an error with your request. Please try again.</p>
              <p>
                If the error persists,&nbsp;
                <Hyperlink destination={configuration.ENTERPRISE_SUPPORT_URL}>
                  contact customer support.
                </Hyperlink>
              </p>
            </Alert>
            )}
        <h3>Email Template</h3>
        <Form>
          <Form.Group controlId="email-template-greeting">
            <Form.Label>Customize Greeting</Form.Label>
            <Form.Control
              rows={3}
              as="textarea"
              data-hj-suppress
              value={emailTemplate.greeting}
              onChange={(e) => setEmailTemplate({ ...emailTemplate, greeting: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="email-template-body">
            <Form.Label>Body</Form.Label>
            <Form.Control
              rows={3}
              as="textarea"
              data-hj-suppress
              value={emailTemplate.body}
              readOnly
            />
          </Form.Group>
          <Form.Group controlId="email-template-closing">
            <Form.Label>Customize Closing</Form.Label>
            <Form.Control
              rows={3}
              as="textarea"
              data-hj-suppress
              value={emailTemplate.closing}
              onChange={(e) => setEmailTemplate({ ...emailTemplate, closing: e.target.value })}
            />
          </Form.Group>
        </Form>

      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            Cancel
          </ModalDialog.CloseButton>
          <StatefulButton
            state={getRemindButtonState()}
            variant="primary"
            onClick={handleSubmit}
            {...{
              labels: {
                default: `Remind (${numberToRemind})`,
                pending: `Reminding (${numberToRemind})`,
                complete: 'Done',
                error: `Retry Remind (${numberToRemind})`,
              },
              icons: {
                pending: <Spinner animation="border" variant="light" size="sm" />,
              },
              disabledStates: ['pending', 'complete'],
            }}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

LicenseManagementRemindModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    isRevocationCapEnabled: PropTypes.bool.isRequired,
    revocations: PropTypes.shape({
      applied: PropTypes.number.isRequired,
      remaining: PropTypes.number.isRequired,
    }),
  }).isRequired,
  usersToRemind: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default LicenseManagementRemindModal;
