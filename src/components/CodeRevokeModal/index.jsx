import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';
import SaveTemplateButton from '../../containers/SaveTemplateButton';

import H3 from '../H3';
import TextAreaAutoSize from '../TextAreaAutoSize';
import RenderField from '../RenderField';
import StatusAlert from '../StatusAlert';
import TemplateSourceFields from '../../containers/TemplateSourceFields';

import { validateEmailTemplateFields } from '../../utils';

class CodeRevokeModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.state = {
      mode: 'revoke',
    };

    this.setMode = this.setMode.bind(this);
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

  setMode(mode) {
    this.setState({ mode });
  }

  validateFormData(formData) {
    const emailTemplateKey = 'email-template-body';

    /* eslint-disable no-underscore-dangle */
    const errors = validateEmailTemplateFields(formData);

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

    this.setMode('revoke');

    // Validate form data
    this.validateFormData(formData);

    const options = {
      template: formData['email-template-body'],
      template_subject: formData['email-template-subject'],
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
            <TemplateSourceFields emailTemplateType="revoke" />
            <Field
              id="email-template-subject"
              name="email-template-subject"
              component={RenderField}
              label="Customize Email Subject"
            />
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
