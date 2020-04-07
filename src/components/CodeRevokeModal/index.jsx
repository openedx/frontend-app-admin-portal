import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';
import SaveTemplateButton from '../../containers/SaveTemplateButton';

import H3 from '../H3';
import TextAreaAutoSize from '../TextAreaAutoSize';
import StatusAlert from '../StatusAlert';


class CodeRevokeModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.state = {
      mode: 'revoke',
      fields: {
        'email-template-greeting': null,
        'email-template-closing': null,
      },
    };

    this.setMode = this.setMode.bind(this);
    this.validateFormData = this.validateFormData.bind(this);
    this.handleModalSubmit = this.handleModalSubmit.bind(this);
    this.handleFieldOnChange = this.handleFieldOnChange.bind(this);
    this.renderSaveTemplateMessage = this.renderSaveTemplateMessage.bind(this);
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
    const {
      mode,
    } = this.state;

    const errorMessageRef = this.errorMessageRef && this.errorMessageRef.current;

    if (mode === 'revoke' && submitSucceeded && submitSucceeded !== prevProps.submitSucceeded) {
      onClose();
    }

    if (submitFailed && error !== prevProps.error && errorMessageRef) {
      // When there is an new error, focus on the error message status alert
      errorMessageRef.focus();
    }
  }

  getTemplatesData() {
    const data = { ...this.props.initialValues };
    Object.entries(this.state.fields).forEach(([key, value]) => {
      // Should update for empty greeting and closing as well
      data[key] = value === null ? data[key] : value;
    });

    return data;
  }

  setMode(mode) {
    this.setState({ mode });
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

  hasIndividualRevokeData() {
    const { data } = this.props;
    return ['code', 'assigned_to'].every(key => key in data);
  }

  handleFieldOnChange(event, newValue, previousValue, name) {
    this.setState(prevState => ({
      fields: {
        ...prevState.fields,
        [name]: newValue,
      },
    }));
  }

  isSaveDisabled() {
    const { initialValues, submitting } = this.props;
    const fieldValues = Object.values(this.state.fields);
    const fields = Object.entries(this.state.fields);

    // disable button if form is in submitting state
    if (submitting) return true;

    // disable button if any field as text greater than 300
    const valueNotInRange = fieldValues.some(value => value && value.length > 300);
    if (valueNotInRange) return true;

    // enable button if any field value has changed and new value is different from original value
    const changed = fields.some(([key, value]) => value !== null && value !== initialValues[key]);
    if (changed) return false;

    return true;
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

    this.setMode('revoke');

    // Validate form data
    this.validateFormData(formData);

    const options = {
      template: formData['email-template-body'],
      template_greeting: formData['email-template-greeting'],
      template_closing: formData['email-template-closing'],
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
      submitSucceeded,
    } = this.props;
    const {
      mode,
    } = this.state;


    return (
      <React.Fragment>
        {submitFailed && this.renderErrorMessage()}
        {mode === 'save' && submitSucceeded && this.renderSaveTemplateMessage()}
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
              id="email-template-greeting"
              name="email-template-greeting"
              component={TextAreaAutoSize}
              label="Customize Greeting"
              onChange={this.handleFieldOnChange}
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
              onChange={this.handleFieldOnChange}
            />
          </div>
        </form>
      </React.Fragment>
    );
  }

  renderErrorMessage() {
    const modeErrors = {
      revoke: 'Unable to revoke code(s)',
      save: 'Unable to save template',
    };
    const { error } = this.props;
    const { mode } = this.state;

    return (
      <div
        ref={this.errorMessageRef}
        tabIndex="-1"
      >
        <StatusAlert
          alertType="danger"
          iconClassName="fa fa-times-circle"
          title={modeErrors[mode]}
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

  renderSaveTemplateMessage() {
    return (
      <div
        ref={this.errorMessageRef}
        tabIndex="-1"
      >
        <StatusAlert
          alertType="success"
          iconClassName="fa fa-check"
          message="Template saved successfully"
          dismissible
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
    const {
      mode,
    } = this.state;

    return (
      <React.Fragment>
        <Modal
          ref={this.modalRef}
          title={this.renderTitle()}
          body={this.renderBody()}
          buttons={[
            <Button
              key="revoke-submit-btn"
              disabled={submitting}
              className="code-revoke-save-btn btn-primary"
              onClick={handleSubmit(this.handleModalSubmit)}
            >
              <React.Fragment>
                {mode === 'revoke' && submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
                {'Revoke'}
              </React.Fragment>
            </Button>,
            <SaveTemplateButton
              key="save-revoke-template-btn"
              templateType="revoke"
              setMode={this.setMode}
              handleSubmit={handleSubmit}
              templateData={this.getTemplatesData()}
              disabled={this.isSaveDisabled()}
            />,
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
  data: PropTypes.shape({
    selectedCodes: PropTypes.arrayOf(PropTypes.shape({})),
    assigned_to: PropTypes.string,
    code: PropTypes.string,
  }),
  initialValues: PropTypes.shape({}).isRequired,
};

export default reduxForm({
  form: 'code-revoke-modal-form',
})(CodeRevokeModal);
