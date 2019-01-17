import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';

import H3 from '../H3';
import TextAreaAutoSize from '../TextAreaAutoSize';
import StatusAlert from '../StatusAlert';

import emailTemplate from './emailTemplate';

import './AssignmentReminderModal.scss';

class AssignmentReminderModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.validateFormData = this.validateFormData.bind(this);
    this.handleModalSubmit = this.handleModalSubmit.bind(this);
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

  validateFormData(formData) {
    const emailTemplateKey = 'email-template';

    let errors = {}; // eslint-disable-line prefer-const

    /* eslint-disable no-underscore-dangle */
    if (!formData[emailTemplateKey]) {
      const message = 'An email template is required.';
      errors[emailTemplateKey] = message;
      errors._error.push(message);
    }

    if (Object.keys(errors).length) {
      throw new SubmissionError(errors);
    }
    /* eslint-enable no-underscore-dangle */
  }

  hasIndividualAssignData() {
    const { data } = this.props;
    return ['code', 'email'].every(key => key in data);
  }

  handleModalSubmit(formData) {
    const {
      couponId,
      isBulkAssign,
      data,
      sendAssignmentReminder,
    } = this.props;

    // Validate form data
    this.validateFormData(formData);

    // Configure the options to send to the assignment reminder API endpoint
    const options = {
      template: formData['email-template'],
    };

    if (isBulkAssign) {
      options.assignments = data.selectedCodes.map(code => ({
        email: code.assigned_to,
        code: code.code,
      }));
    } else {
      options.assignments = [{ email: data.email, code: data.code }];
    }
    return sendAssignmentReminder(couponId, options)
      .then((response) => {
        this.props.onSuccess(response);
      })
      .catch((error) => {
        throw new SubmissionError({
          _error: [error.message],
        });
      });
  }

  renderBody() {
    const {
      data,
      isBulkAssign,
      submitFailed,
    } = this.props;

    return (
      <React.Fragment>
        {submitFailed && this.renderErrorMessage()}
        <div className="assignment-details mb-4">
          {!isBulkAssign && this.hasIndividualAssignData() && (
            <React.Fragment>
              <p>Code: {data.code}</p>
              <p>Email: {data.email}</p>
            </React.Fragment>
          )}
        </div>
        <form onSubmit={e => e.preventDefault()}>
          <div className="mt-4">
            <H3>Email Template</H3>
            <Field
              id="email-template"
              name="email-template"
              component={TextAreaAutoSize}
              label={
                <React.Fragment>
                  Customize Message
                  <span className="required">*</span>
                </React.Fragment>
              }
              required
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
          iconClassNames={['fa', 'fa-times-circle']}
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
    const { title } = this.props;

    return (
      <React.Fragment>
        <span className="d-block">{title}</span>
        <small>Assignment Reminder</small>
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
              label={
                <React.Fragment>
                  {submitting && <Icon className={['fa', 'fa-spinner', 'fa-spin', 'mr-2']} />}
                  {'Remind'}
                </React.Fragment>
              }
              disabled={submitting}
              buttonType="primary"
              onClick={handleSubmit(this.handleModalSubmit)}
            />,
          ]}
          onClose={onClose}
          open
        />
      </React.Fragment>
    );
  }
}

AssignmentReminderModal.defaultProps = {
  error: null,
  isBulkAssign: false,
  data: {},
};

AssignmentReminderModal.propTypes = {
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
  sendAssignmentReminder: PropTypes.func.isRequired,
  isBulkAssign: PropTypes.bool,
  data: PropTypes.shape({}),
};

export default reduxForm({
  form: 'code-assignment-modal-form',
  initialValues: {
    'email-template': emailTemplate,
  },

})(AssignmentReminderModal);
