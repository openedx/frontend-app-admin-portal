import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import {
  Button, Icon, Alert, ModalDialog, ActionRow,
} from '@edx/paragon';
import { Cancel as ErrorIcon } from '@edx/paragon/icons';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import emailTemplate from './emailTemplate';
import TextAreaAutoSize from '../TextAreaAutoSize';
import FileInput from '../FileInput';
import { extractSalesforceIds, returnValidatedEmails, validateEmailAddrTemplateForm } from '../../data/validation/email';
import { normalizeFileUpload } from '../../utils';

class InviteLearnersModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();

    this.handleModalSubmit = this.handleModalSubmit.bind(this);
  }

  componentDidMount() {
    const { contactEmail } = this.props;

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
      addLicensesForUsers,
      subscriptionUUID,
    } = this.props;

    const emailTemplateKey = 'email-template-body';
    // Validate form data
    validateEmailAddrTemplateForm(formData, emailTemplateKey);

    const options = {
      template: formData[emailTemplateKey],
      greeting: formData['email-template-greeting'],
      closing: formData['email-template-closing'],
    };

    options.user_emails = returnValidatedEmails(formData);
    const SFIDs = extractSalesforceIds(formData, options.user_emails);
    if (SFIDs) {
      options.user_sfids = SFIDs;
    }

    /* eslint-disable no-underscore-dangle */
    return addLicensesForUsers(options, subscriptionUUID)
      .then((response) => {
        const result = camelCaseObject(response.data);
        this.props.onSuccess(result);
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
      <>
        {submitFailed && this.renderErrorMessage()}
        <form onSubmit={e => e.preventDefault()}>
          <p>Unassigned licenses: {availableSubscriptionCount}</p>
          <div className="mt-4">
            <h3>Add Users</h3>
            <Field
              name="email-addresses"
              component={TextAreaAutoSize}
              label="Email Address"
              description="To add more than one user, enter one email address per line."
              data-hj-suppress
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
              normalize={normalizeFileUpload}
              data-hj-suppress
            />
            <h3>Email Template</h3>
            <Field
              name="email-template-greeting"
              component={TextAreaAutoSize}
              label="Customize Greeting"
              data-hj-suppress
            />
            <Field
              name="email-template-body"
              component={TextAreaAutoSize}
              label="Body"
              disabled
            />
            <Field
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
          <Alert.Heading>Unable to subscribe users</Alert.Heading>
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

  render() {
    const {
      onClose,
      submitting,
      handleSubmit,
    } = this.props;

    return (
      <ModalDialog
        isOpen
        onClose={onClose}
        className="add-users"
        hasCloseButton
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            Invite learners
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          {this.renderBody()}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="link">
              Cancel
            </ModalDialog.CloseButton>
            <Button
              key="subscribe-users-submit-btn"
              disabled={submitting}
              className="subscribe-users-save-btn"
              onClick={handleSubmit(this.handleModalSubmit)}
            >
              <>
              {submitting && <Spinner animation="border" className="mr-2" variant="primary" size="sm" />}
                Invite learners
              </>
            </Button>,
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }
}

InviteLearnersModal.defaultProps = {
  error: null,
  contactEmail: null,
};

InviteLearnersModal.propTypes = {
  // props From redux-form
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  error: PropTypes.arrayOf(PropTypes.string),
  initialize: PropTypes.func.isRequired,

  // custom props
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  addLicensesForUsers: PropTypes.func.isRequired,
  subscriptionUUID: PropTypes.string.isRequired,

  availableSubscriptionCount: PropTypes.number.isRequired,
  contactEmail: PropTypes.string,
};

export default reduxForm({
  form: 'license-assignment-modal-form',
})(InviteLearnersModal);
