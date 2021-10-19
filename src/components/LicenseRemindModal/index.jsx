import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import {
  Button, Icon, Modal, Alert,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { Cancel as ErrorIcon } from '@edx/paragon/icons';

import TextAreaAutoSize from '../TextAreaAutoSize';

import { validateEmailTemplateForm } from '../../data/validation/email';
import emailTemplate from './emailTemplate';

class LicenseRemindModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.handleModalSubmit = this.handleModalSubmit.bind(this);
  }

  componentDidMount() {
    const { current: { firstFocusableElement } } = this.modalRef;
    const { contactEmail } = this.props;

    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
    this.props.initialize({
      'email-template-greeting': emailTemplate.greeting,
      'email-template-body': emailTemplate.body,
      'email-template-closing': emailTemplate.closing(contactEmail),
    });
  }

  componentDidUpdate(prevProps) {
    const {
      submitFailed,
      submitSucceeded,
      onClose,
      error,
    } = this.props;

    const errorMessageRef = this.errorMessageRef && this.errorMessageRef.current;

    if (submitSucceeded && submitSucceeded !== prevProps.submitSucceeded) {
      onClose();
    }

    if (submitFailed && error !== prevProps.error && errorMessageRef) {
      // When there is an new error, focus on the error message status alert
      errorMessageRef.focus();
    }
  }

  handleModalSubmit(formData) {
    const {
      isBulkRemind,
      user,
      subscriptionUUID,
      sendLicenseReminder,
    } = this.props;
    // Validate form data

    validateEmailTemplateForm(formData, 'email-template-body', false);
    // Configure the options to send to the assignment reminder API endpoint
    const options = {
      greeting: formData['email-template-greeting'],
      closing: formData['email-template-closing'],
    };

    if (!isBulkRemind && user) {
      options.user_email = user.userEmail;
    }
    return sendLicenseReminder(options, subscriptionUUID, isBulkRemind)
      .then(response => this.props.onSuccess(response))
      .catch((error) => {
        logError(error);
        throw new SubmissionError({
          _error: [error.message],
        });
      });
    /* eslint-enable no-underscore-dangle */
  }

  renderBody() {
    const {
      isBulkRemind,
      submitFailed,
      user,
      pendingUsersCount,
    } = this.props;

    return (
      <>
        {submitFailed && this.renderErrorMessage()}
        <div className="assignment-details mb-4">
          <>
            {isBulkRemind ? (
              <p className="bulk-selected-codes">Unredeemed Licenses: {pendingUsersCount}</p>
            ) : (
              <p className="bulk-selected-codes" data-hj-suppress>Email: {user.userEmail}</p>
            )}
          </>
        </div>
        <form onSubmit={e => e.preventDefault()}>
          <div className="mt-4">
            <h3>Email Template</h3>
            <Field
              id="email-template-greeting"
              name="email-template-greeting"
              component={TextAreaAutoSize}
              label="Customize Greeting"
              data-hj-suppress
            />
            <Field
              id="email-template-body"
              name="email-template-body"
              component={TextAreaAutoSize}
              label="Body"
              disabled
              data-hj-suppress
            />
            <Field
              id="email-template-closing"
              name="email-template-closing"
              component={TextAreaAutoSize}
              label="Customize Closing"
              data-hj-suppress
            />
          </div>
        </form>
      </>
    );
  }

  renderErrorMessage() {
    const { error } = this.props;

    return (
      <div
        ref={this.errorMessageRef}
        tabIndex="-1"
      >
        <Alert
          variant="danger"
          icon={ErrorIcon}
        >
          <Alert.Heading>Unable to send reminder email</Alert.Heading>
          {error.length > 1 ? (
            <ul className="m-0 pl-4">
              {error.map(message => <li key={message}>{message}</li>)}
            </ul>
          ) : (
            error[0]
          )}
        </Alert>
      </div>
    );
  }

  renderTitle() {
    return this.props.title;
  }

  render() {
    const {
      onClose,
      submitting,
      handleSubmit,
    } = this.props;
    return (
      <>
        <Modal
          ref={this.modalRef}
          dialogClassName="license-remind"
          title={this.renderTitle()}
          body={this.renderBody()}
          buttons={[
            <Button
              key="license-remind-submit-btn"
              disabled={submitting}
              className="license-remind-save-btn btn-primary"
              onClick={handleSubmit(this.handleModalSubmit)}
            >
              <>
                {submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
                Send Reminder
              </>
            </Button>,
          ]}
          closeText="Cancel"
          onClose={onClose}
          open
        />
      </>
    );
  }
}
LicenseRemindModal.defaultProps = {
  error: null,
  isBulkRemind: false,
  user: {},
  pendingUsersCount: 0,
  contactEmail: null,
};
LicenseRemindModal.propTypes = {
  // props From redux-form
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  error: PropTypes.arrayOf(PropTypes.string),
  initialize: PropTypes.func.isRequired,
  // custom props
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  sendLicenseReminder: PropTypes.func.isRequired,
  isBulkRemind: PropTypes.bool,
  pendingUsersCount: PropTypes.number,
  user: PropTypes.shape({
    userEmail: PropTypes.string,
  }),
  subscriptionUUID: PropTypes.string.isRequired,
  contactEmail: PropTypes.string,
};
export default reduxForm({
  form: 'license-reminder-modal-form',
})(LicenseRemindModal);
