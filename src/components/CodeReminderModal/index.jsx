import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';
import SaveTemplateButton from '../../containers/SaveTemplateButton';

import TextAreaAutoSize from '../TextAreaAutoSize';
import RenderField from '../RenderField';
import StatusAlert from '../StatusAlert';
import TemplateSourceFields from '../../containers/TemplateSourceFields';

import { EMAIL_TEMPLATE_SUBJECT_KEY } from '../../data/constants/emailTemplate';
import { validateEmailTemplateForm } from '../../data/validation/email';

import './CodeReminderModal.scss';

class CodeReminderModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.state = {
      mode: 'remind',
    };

    this.setMode = this.setMode.bind(this);
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
    const {
      mode,
    } = this.state;

    const errorMessageRef = this.errorMessageRef && this.errorMessageRef.current;

    if (mode === 'remind' && submitSucceeded && submitSucceeded !== prevProps.submitSucceeded) {
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

  setMode(mode) {
    this.setState({ mode });
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
    this.setMode('remind');

    // Validate form data
    const emailTemplateKey = 'email-template-body';
    validateEmailTemplateForm(formData, emailTemplateKey);

    // Configure the options to send to the assignment reminder API endpoint
    const options = {
      template: formData[emailTemplateKey],
      template_subject: formData[EMAIL_TEMPLATE_SUBJECT_KEY],
      template_greeting: formData['email-template-greeting'],
      template_closing: formData['email-template-closing'],
    };

    if (formData['template-id']) {
      options.template_id = formData['template-id'];
    }

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
      <>
        {submitFailed && this.renderErrorMessage()}
        <div className="assignment-details mb-4">
          {!isBulkRemind && this.hasIndividualRemindData() && (
            <>
              <p>Code: {data.code}</p>
              <p>Email: {data.email}</p>
            </>
          )}
          {isBulkRemind && numberOfSelectedCodes > 0 && (
            <>
              <p className="bulk-selected-codes">Selected Codes: {numberOfSelectedCodes}</p>
            </>
          )}
        </div>
        <form onSubmit={e => e.preventDefault()}>
          <div className="mt-4">
            <h3>Email Template</h3>
            <TemplateSourceFields emailTemplateType="remind" />
            <Field
              id="email-template-subject"
              name="email-template-subject"
              component={RenderField}
              label="Customize Email Subject"
              type="text"
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
      </>
    );
  }

  renderErrorMessage() {
    const modeErrors = {
      remind: 'Unable to send reminder email',
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
    return this.props.title;
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
      <>
        <Modal
          ref={this.modalRef}
          dialogClassName="code-reminder"
          title={this.renderTitle()}
          body={this.renderBody()}
          buttons={[
            <Button
              key="remind-submit-btn"
              disabled={submitting}
              className="code-remind-save-btn"
              onClick={handleSubmit(this.handleModalSubmit)}
            >
              <>
                {mode === 'remind' && submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
                Remind
              </>
            </Button>,
            <SaveTemplateButton
              key="save-remind-template-btn"
              templateType="remind"
              setMode={this.setMode}
              handleSubmit={handleSubmit}
            />,
          ]}
          onClose={onClose}
          open
        />
      </>
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
  data: PropTypes.shape({
    selectedCodes: PropTypes.arrayOf(PropTypes.shape({})),
    code: PropTypes.string,
    email: PropTypes.string,
  }),
};

export default reduxForm({
  form: 'code-reminder-modal-form',
})(CodeReminderModal);
