import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';

import H3 from '../H3';
import TextAreaAutoSize from '../TextAreaAutoSize';
import StatusAlert from '../StatusAlert';
import FileInput from '../FileInput';
import {
  validateEmailTemplateFields,
  validateEmailAddresses,
  validateEmailAddressesFields,
  mergeErrors,
} from '../../utils';

class AddUsersModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.validateFormData = this.validateFormData.bind(this);
    this.handleModalSubmit = this.handleModalSubmit.bind(this);
  }

  componentDidMount() {
    const {
      enterpriseId,
      fetchSubscriptionDetails,
    } = this.props;

    if (enterpriseId) {
      fetchSubscriptionDetails(enterpriseId);
    }

    const { current: { firstFocusableElement } } = this.modalRef;

    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
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

  componentWillUnmount() {
    // Clear the subscription data
    this.props.clearSubscriptionDetails();
  }

  validateFormData(formData) {
    const userEmailsKey = 'email-addresses';
    const emailsCSVKey = 'csv-email-addresses';
    const emailTemplateKey = 'email-template-body';

    /* eslint-disable no-underscore-dangle */
    let errors = validateEmailTemplateFields(formData);

    if (!formData[emailTemplateKey]) {
      const message = 'An email template is required.';
      errors[emailTemplateKey] = message;
      errors._error.push(message);
    }

    if (!formData[userEmailsKey] && !formData[emailsCSVKey]) {
      const message = 'Either user emails or emails csv must be provided.';
      errors[userEmailsKey] = message;
      errors[emailsCSVKey] = message;
      errors._error.push(message);
    }

    const emailFieldErrors = validateEmailAddressesFields(formData);
    errors = mergeErrors(errors, emailFieldErrors);

    if (errors._error.length > 0) {
      throw new SubmissionError(errors);
    }
    /* eslint-enable no-underscore-dangle */
  }

  normalizeFileUpload(value) {
    return value && value.split(/\r\n|\n/);
  }

  handleModalSubmit(formData) {
    const {
      subscribeUsers,
    } = this.props;

    // Validate form data
    this.validateFormData(formData);

    const payload = {
      template: formData['email-template-body'],
      template_greeting: formData['email-template-greeting'],
      template_closing: formData['email-template-closing'],
    };
    const hasTextAreaEmails = !!formData['email-addresses'];
    const emails = hasTextAreaEmails ? formData['email-addresses'].split(/\r\n|\n/) : formData['csv-email-addresses'];
    const { validEmails } = validateEmailAddresses(emails);
    payload.emails = validEmails;

    /* eslint-disable no-underscore-dangle */
    return subscribeUsers(payload)
      .then((response) => {
        this.props.onSuccess(response);
      })
      .catch((error) => {
        throw new SubmissionError({
          _error: [error.message],
        });
      });
    /* eslint-enable no-underscore-dangle */
  }

  renderBody() {
    const {
      submitFailed, availableSubscriptionCount,
    } = this.props;

    return (
      <React.Fragment>
        {submitFailed && this.renderErrorMessage()}
        <form onSubmit={e => e.preventDefault()}>
          <div className="mt-4">
            <p>Unassigned licenses: {availableSubscriptionCount}</p>
          </div>
          <div className="mt-4">
            <H3>Add User</H3>
            <Field
              id="email-addresses"
              name="email-addresses"
              component={TextAreaAutoSize}
              label={
                <React.Fragment>
                  Email Address
                  <span className="required">*</span>
                </React.Fragment>
              }
              description="To add more than one user, enter one email address per line."
            />
            <p className="pb-2">
              OR
            </p>
            <Field
              id="csv-email-addresses"
              name="csv-email-addresses"
              component={FileInput}
              label="Upload Email Addresses"
              description="The file must be a CSV containing a single column of email addresses."
              accept=".csv"
              normalize={this.normalizeFileUpload}
            />
            <H3>Email Template</H3>
            <Field
              id="email-template-greeting"
              name="email-template-greeting"
              component={TextAreaAutoSize}
              label="Customize Greeting"
            />
            <Field
              id="email-template-body"
              name="email-template-body"
              component={TextAreaAutoSize}
              label="Body"
              disabled
            />
            <Field
              id="email-template-closing"
              name="email-template-closing"
              component={TextAreaAutoSize}
              label="Customize Closing"
            />
          </div>
        </form>
      </React.Fragment>
    );
  }

  renderErrorMessage() {
    const { error } = this.props;

    return (
      <div
        ref={this.errorMessageRef}
        tabIndex="-1"
      >
        <StatusAlert
          alertType="danger"
          iconClassName="fa fa-times-circle"
          title="Unable to subscribe users"
          message={error.length > 1 ? (
            <ul className="m-0 pl-4">
              {error.map(message => <li key={message}>{message}</li>)}
            </ul>
          ) : (
              error[0]
            )}
        />
      </div>
    );
  }

  renderTitle() {
    const { title } = this.props;

    return (
      <React.Fragment>
        <span className="d-block">{title}</span>
        <small>Add Subscriptions</small>
      </React.Fragment>
    );
  }

  render() {
    const {
      onClose,
      submitting,
      handleSubmit,
    } = this.props;

    return (
      <React.Fragment>
        <Modal
          ref={this.modalRef}
          title={this.renderTitle()}
          body={this.renderBody()}
          buttons={[
            <Button
              key="subscribe-users-submit-btn"
              disabled={submitting}
              className="subscribe-users-save-btn btn-primary"
              onClick={handleSubmit(this.handleModalSubmit)}
            >
              <React.Fragment>
                {submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
                {'Assign License(s)'}
              </React.Fragment>
            </Button>,
          ]}
          closeText="Cancel"
          onClose={onClose}
          open
        />
      </React.Fragment>
    );
  }
}

AddUsersModal.defaultProps = {
  error: null,
  enterpriseId: null,
};

AddUsersModal.propTypes = {
  // props From redux-form
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  error: PropTypes.arrayOf(PropTypes.string),

  // custom props
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  subscribeUsers: PropTypes.func.isRequired,
  fetchSubscriptionDetails: PropTypes.func.isRequired,
  clearSubscriptionDetails: PropTypes.func.isRequired,

  initialValues: PropTypes.shape({}).isRequired,
  availableSubscriptionCount: PropTypes.number.isRequired,
  enterpriseId: PropTypes.string,
};

export default reduxForm({
  form: 'user-subscription-modal-form',
})(AddUsersModal);
