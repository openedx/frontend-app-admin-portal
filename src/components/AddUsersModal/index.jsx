import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';

import H3 from '../H3';
import TextAreaAutoSize from '../TextAreaAutoSize';
import StatusAlert from '../StatusAlert';
import FileInput from '../FileInput';
import {
  validateEmailAddresses,
  camelCaseObject,
} from '../../utils';
import { EMAIL_ADDRESS_TEXT_FORM_DATA, EMAIL_ADDRESS_CSV_FORM_DATA } from '../../data/constants/addUsers';
import EmailTemplate from '../EmailTemplate';
import { EmailTemplateContext } from '../EmailTemplate/EmailTemplateData';
import SaveTemplateButton from '../EmailTemplate/SaveTemplateButton';
import { validateFormData } from './validators';

const AddUsersModal = ({
  title,
  onClose,
  onSuccess,
  addLicensesForUsers,
  subscriptionUUID,
  availableSubscriptionCount,
  handleSubmit,
  submitting,
  submitSucceeded,
  submitFailed,
  error,
}) => {
  const errorMessageRef = React.createRef();
  const modalRef = React.createRef();
  const {
    saveEmailTemplate, errors: emailTemplateErrors, currentTemplate,
  } = useContext(EmailTemplateContext);

  useEffect(() => {
    const { current: { firstFocusableElement } } = modalRef;

    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
  }, []);
  useEffect(() => {
    if (submitSucceeded) {
      onClose();
    }
  }, [submitSucceeded]);
  useEffect(() => {
    if (
      errorMessageRef && errorMessageRef.current &&
      (error.length > 0 || emailTemplateErrors.length > 0)
    ) {
      errorMessageRef.current.focus();
    }
  }, [error, emailTemplateErrors]);

  const handleModalSubmit = (formData) => {
    // Validate form data
    validateFormData(formData, currentTemplate);

    const options = {
      subject: currentTemplate['email-template-subject'],
      greeting: currentTemplate['email-template-greeting'],
      closing: currentTemplate['email-template-closing'],
    };

    // Validate email addresses from both the text area and the CSV file and
    // submit to the backend for emails to be sent and/or error to be displayed
    const emails = [];
    if (formData[EMAIL_ADDRESS_TEXT_FORM_DATA] && formData[EMAIL_ADDRESS_TEXT_FORM_DATA].length) {
      emails.push(...formData[EMAIL_ADDRESS_TEXT_FORM_DATA].split(/\r\n|\n/));
    }
    if (formData[EMAIL_ADDRESS_CSV_FORM_DATA] && formData[EMAIL_ADDRESS_CSV_FORM_DATA].length) {
      emails.push(...formData[EMAIL_ADDRESS_CSV_FORM_DATA]);
    }
    options.user_emails = validateEmailAddresses(emails).validEmails;

    /* eslint-disable no-underscore-dangle */
    return addLicensesForUsers(options, subscriptionUUID)
      .then((response) => {
        const result = camelCaseObject(response.data);
        onSuccess(result);
      })
      .catch((err) => {
        throw new SubmissionError({
          _error: [err.message],
        });
      });
    /* eslint-enable no-underscore-dangle */
  };

  const errors = [...error, ...emailTemplateErrors];
  return (
    <React.Fragment>
      <Modal
        ref={modalRef}
        title={<span className="d-block">{title}</span>}
        body={
          <React.Fragment>
            {
              (submitFailed || emailTemplateErrors.length > 0) && (
                <div
                  ref={errorMessageRef}
                  tabIndex="-1"
                >
                  <StatusAlert
                    alertType="danger"
                    iconClassName="fa fa-times-circle"
                    title="Unable to process your request"
                    message={errors.length > 1 ? (
                      <ul className="m-0 pl-4">
                        {
                          errors.map(message => <li key={message}>{message}</li>)
                        }
                      </ul>
                    ) : (
                      errors[0]
                    )}
                  />
                </div>
              )
            }
            <form onSubmit={e => e.preventDefault()}>
              <p>Unassigned licenses: {availableSubscriptionCount}</p>
              <div className="mt-4">
                <H3>Add Users</H3>
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
                  normalize={value => value && value.split(/\r\n|\n/)}
                />
                <EmailTemplate />
              </div>
            </form>
          </React.Fragment>
        }
        buttons={[
          <Button
            key="subscribe-users-submit-btn"
            disabled={submitting}
            className="subscribe-users-save-btn btn-primary"
            onClick={handleSubmit(handleModalSubmit)}
          >
            <React.Fragment>
              {submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
              {'Assign License(s)'}
            </React.Fragment>
          </Button>,
          <SaveTemplateButton key="save-template-button-assign-email-template" onClick={saveEmailTemplate} />,
        ]}
        closeText="Cancel"
        onClose={onClose}
        open
      />
    </React.Fragment>
  );
};

AddUsersModal.defaultProps = {
  error: [],
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
  addLicensesForUsers: PropTypes.func.isRequired,
  subscriptionUUID: PropTypes.string.isRequired,

  availableSubscriptionCount: PropTypes.number.isRequired,
};

export default reduxForm({
  form: 'license-assignment-modal-form',
})(AddUsersModal);
