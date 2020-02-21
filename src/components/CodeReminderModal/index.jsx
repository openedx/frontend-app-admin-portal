import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';

import H3 from '../H3';
import TextAreaAutoSize from '../TextAreaAutoSize';
import StatusAlert from '../StatusAlert';

import './CodeReminderModal.scss';

class CodeReminderModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.validateFormData = this.validateFormData.bind(this);
    this.handleModalSubmit = this.handleModalSubmit.bind(this);
    this.getNumberOfSelectedCodes = this.getNumberOfSelectedCodes.bind(this);
  }

  componentDidMount() {
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

  getNumberOfSelectedCodes() {
    const {
      data: { selectedCodes },
      couponDetailsTable: { data: tableData },
    } = this.props;
    let numberOfSelectedCodes = 0;
    if (selectedCodes && selectedCodes.length) {
      numberOfSelectedCodes = selectedCodes.length;
    } else if (tableData && tableData.count) {
      numberOfSelectedCodes = tableData.count;
    }
    return numberOfSelectedCodes;
  }

  validateFormData(formData) {
    const emailTemplateKey = 'email-template-body';
    const errors = {
      _error: [],
    };

    /* eslint-disable no-underscore-dangle */
    if (!formData[emailTemplateKey]) {
      const message = 'An email template is required.';
      errors[emailTemplateKey] = message;
      errors._error.push(message);
    }

    if (errors._error.length > 0) {
      throw new SubmissionError(errors);
    }
    /* eslint-enable no-underscore-dangle */
  }

  hasIndividualRemindData() {
    const { data } = this.props;
    return ['code', 'email'].every(key => key in data);
  }

  handleModalSubmit(formData) {
    const {
      couponId,
      isBulkRemind,
      selectedToggle,
      data,
      sendCodeReminder,
    } = this.props;

    // Validate form data
    this.validateFormData(formData);

    // Configure the options to send to the assignment reminder API endpoint
    const options = {
      template: formData['email-template-body'],
      template_greeting: formData['email-template-greeting'],
      template_closing: formData['email-template-closing'],
    };

    if (isBulkRemind && !data.selectedCodes.length) {
      options.code_filter = selectedToggle;
    } else if (isBulkRemind && data.selectedCodes.length) {
      options.assignments = data.selectedCodes.map(code => ({
        email: code.assigned_to,
        code: code.code,
      }));
    } else {
      options.assignments = [{ email: data.email, code: data.code }];
    }

    return sendCodeReminder(couponId, options)
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
      data,
      isBulkRemind,
      submitFailed,
    } = this.props;

    const numberOfSelectedCodes = this.getNumberOfSelectedCodes();

    return (
      <React.Fragment>
        {submitFailed && this.renderErrorMessage()}
        <div className="assignment-details mb-4">
          {!isBulkRemind && this.hasIndividualRemindData() && (
            <React.Fragment>
              <p>Code: {data.code}</p>
              <p>Email: {data.email}</p>
            </React.Fragment>
          )}
          {isBulkRemind && numberOfSelectedCodes > 0 && (
            <React.Fragment>
              <p className="bulk-selected-codes">Selected Codes: {numberOfSelectedCodes}</p>
            </React.Fragment>
          )}
        </div>
        <form onSubmit={e => e.preventDefault()}>
          <div className="mt-4">
            <H3>Email Template</H3>
            <Field
              id="email-template-greeting"
              name="email-template-greeting"
              component={TextAreaAutoSize}
              label={
                <React.Fragment>
                  Customize Greeting
                </React.Fragment>
              }
            />
            <Field
              id="email-template-body"
              name="email-template-body"
              component={TextAreaAutoSize}
              label={
                <React.Fragment>
                  Body
                </React.Fragment>
              }
              disabled
            />
            <Field
              id="email-template-closing"
              name="email-template-closing"
              component={TextAreaAutoSize}
              label={
                <React.Fragment>
                  Customize Closing
                </React.Fragment>
              }
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
          title="Unable to send reminder email"
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
    const { title, data } = this.props;
    return (
      <React.Fragment>
        <span className="d-block">{title}</span>
        <small>
          {data.selectedCodes && data.selectedCodes.length === 0 ? 'Remind All' : 'Assignment Reminder'}
        </small>
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
              disabled={submitting}
              className="code-remind-save-btn btn-primary"
              onClick={handleSubmit(this.handleModalSubmit)}
            >
              <React.Fragment>
                {submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
                {'Remind'}
              </React.Fragment>
            </Button>,
          ]}
          onClose={onClose}
          open
        />
      </React.Fragment>
    );
  }
}

CodeReminderModal.defaultProps = {
  error: null,
  isBulkRemind: false,
  data: {},
  selectedToggle: null,
  couponDetailsTable: {},
};

CodeReminderModal.propTypes = {
  // props From redux-form
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  error: PropTypes.arrayOf(PropTypes.string),

  // custom props
  couponId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  sendCodeReminder: PropTypes.func.isRequired,
  couponDetailsTable: PropTypes.shape({
    data: PropTypes.shape({
      count: PropTypes.number,
    }),
  }),
  initialValues: PropTypes.shape({}).isRequired,
  isBulkRemind: PropTypes.bool,
  selectedToggle: PropTypes.string,
  data: PropTypes.shape({}),
};

export default reduxForm({
  form: 'code-reminder-modal-form',
})(CodeReminderModal);
