import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';

import H3 from '../H3';
import TextAreaAutoSize from '../TextAreaAutoSize';
import StatusAlert from '../StatusAlert';

import emailTemplate from './emailTemplate';


class CodeRevokeModal extends React.Component {
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

  hasIndividualRevokeData() {
    const { data } = this.props;
    return ['code', 'assigned_to'].every(key => key in data);
  }

  handleModalSubmit(formData) {
    const {
      couponId,
      isBulkRevoke,
      data,
      sendCodeRevoke,
    } = this.props;

    /* eslint-disable no-underscore-dangle */
    const errors = {
      _error: [],
    };

    // Validate form data
    this.validateFormData(formData);

    const options = {
      template: formData['email-template'],
    };

    if (isBulkRevoke) {
      if (!data.selectedCodes.length) {
        errors._error.push('At least one code must be selected.');
        throw new SubmissionError(errors);
      }

      options.assignments = data.selectedCodes.map(code => ({
        email: code.assigned_to,
        code: code.code,
      }));
    } else {
      options.assignments = [{ email: data.assigned_to, code: data.code }];
    }

    return sendCodeRevoke(couponId, options)
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
      isBulkRevoke,
      submitFailed,
    } = this.props;

    return (
      <React.Fragment>
        {submitFailed && this.renderErrorMessage()}
        <div className="assignment-details mb-4">
          {isBulkRevoke && (
            <React.Fragment>
              {data.selectedCodes.length > 0 && <p className="bulk-selected-codes">Selected Codes: {data.selectedCodes.length}</p>}
            </React.Fragment>
          )}
          {!isBulkRevoke && this.hasIndividualRevokeData() && (
            <React.Fragment>
              <p className="code">Code: {data.code}</p>
              <p className="email">Email: {data.assigned_to}</p>
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
          iconClassName="fa fa-times-circle"
          title="Unable to revoke code(s)"
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
        <small>Code Revoke</small>
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
              className="code-revoke-save-btn btn-primary"
              onClick={handleSubmit(this.handleModalSubmit)}
            >
              <React.Fragment>
                {submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
                {'Revoke'}
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

CodeRevokeModal.defaultProps = {
  error: null,
  isBulkRevoke: false,
  data: {},
};

CodeRevokeModal.propTypes = {
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
  sendCodeRevoke: PropTypes.func.isRequired,
  isBulkRevoke: PropTypes.bool,
  data: PropTypes.shape({}),
};

export default reduxForm({
  form: 'code-revoke-modal-form',
  initialValues: {
    'email-template': emailTemplate,
  },
})(CodeRevokeModal);
