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
import { connect } from 'react-redux';
import moment from 'moment';

import { useRequestState } from './LicenseManagementModalHook';
import { validateEmailTemplateForm } from '../../../../data/validation/email';
import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import { configuration } from '../../../../config';
import { getSubscriptionContactText } from '../../../../utils';

const generateEmailTemplate = (contactEmail) => ({
  greeting: 'We noticed you haven’t had a chance to start learning on edX! It’s easy to get started and browse the course catalog.',
  body: '{ENTERPRISE_NAME} partnered with edX to give everyone access to high-quality online courses. '
    + 'Start your subscription and browse courses in nearly every subject including '
    + 'Data Analytics, Digital Media, Business & Leadership, Communications, Computer Science and so much more. '
    + 'Courses are taught by experts from the world’s leading universities and corporations.'
    + '\n\nStart learning: {LICENSE_ACTIVATION_LINK}',
  closing: getSubscriptionContactText(contactEmail),
});

/**
 * Returns StatefulButton labels
 * @param {boolean} remindAllUsers
 * @param {number} userCount
 * @param {number} totalToRemind
 * @returns {Object}
 */
const generateRemindModalSubmitLabel = (remindAllUsers, userCount, totalToRemind) => {
  // If we are not reminding all users, use users.length
  // Else if totalToRemind is passed use that
  // Else use 'All'
  let buttonNumberLabel = 'All';
  if (!remindAllUsers) {
    buttonNumberLabel = userCount;
  } else if (totalToRemind > 0) {
    buttonNumberLabel = totalToRemind;
  }

  return {
    default: `Remind (${buttonNumberLabel})`,
    pending: `Reminding (${buttonNumberLabel})`,
    complete: 'Done',
    error: `Retry remind (${buttonNumberLabel})`,
  };
};

const LicenseManagementRemindModal = ({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
  subscription,
  usersToRemind,
  remindAllUsers,
  totalToRemind,
  contactEmail,
}) => {
  const [requestState, setRequestState, initialRequestState] = useRequestState(isOpen);

  const [emailTemplate, setEmailTemplate] = useState(generateEmailTemplate(contactEmail));
  const isExpired = moment().isAfter(subscription.expirationDate);

  const buttonLabels = generateRemindModalSubmitLabel(remindAllUsers, usersToRemind.length, totalToRemind);

  const title = `Remind User${remindAllUsers || usersToRemind.length > 1 ? 's' : ''}`;

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
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
    };
    if (!remindAllUsers) {
      options.user_emails = userEmailsToRemind;
    }

    LicenseManagerApiService.licenseRemind(
      options,
      subscription.uuid,
      remindAllUsers === undefined ? false : remindAllUsers,
    )
      .then((response) => {
        setRequestState({ ...initialRequestState, success: true });
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
    if (requestState.success) {
      return 'complete';
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
                If the error persists,{' '};
                <Hyperlink destination={configuration.ENTERPRISE_SUPPORT_URL}>
                  contact customer support.
                </Hyperlink>
              </p>
            </Alert>
            )}
        <h3 className="h4">Email Template</h3>
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
            disabled={(!remindAllUsers && usersToRemind.length < 1) || isExpired}
            labels={buttonLabels}
            icons={{
              pending: <Spinner animation="border" variant="light" size="sm" />,
            }}
            disabledStates={['pending', 'complete']}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

LicenseManagementRemindModal.defaultProps = {
  remindAllUsers: false,
  totalToRemind: -1,
  contactEmail: null,
  onSubmit: undefined,
};

LicenseManagementRemindModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  /** Function executed after successful remind request resolved */
  onSuccess: PropTypes.func.isRequired,
  /** Function executed when submit button is pressed */
  onSubmit: PropTypes.func,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    expirationDate: PropTypes.string.isRequired,
  }).isRequired,
  usersToRemind: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
    }),
  ).isRequired,
  remindAllUsers: PropTypes.bool,
  totalToRemind: PropTypes.number,
  contactEmail: PropTypes.string,
};

const mapStateToProps = state => ({
  contactEmail: state.portalConfiguration.contactEmail,
});

export default connect(mapStateToProps)(LicenseManagementRemindModal);
