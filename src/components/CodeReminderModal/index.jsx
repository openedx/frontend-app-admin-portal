import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';
import SaveTemplateButton from '../../containers/SaveTemplateButton';
import { SAVE_TEMPLATE_MODE } from '../SaveTemplateButton';

import { EMAIL_TEMPLATE_SUBJECT_KEY } from '../../data/constants/emailTemplate';
import { validateEmailTemplateForm } from '../../data/validation/email';
import ModalError from './ModalError';
import { configuration } from '../../config';
import './CodeReminderModal.scss';
import CodeDetails from './CodeDetails';
import EmailTemplateForm, { EMAIL_TEMPLATE_FIELDS } from './EmailTemplateForm';
import { MODAL_TYPES } from './constants';

const REMINDER_EMAIL_TEMPLATE_FIELDS = {
  ...EMAIL_TEMPLATE_FIELDS,
  'email-template-body': {
    ...EMAIL_TEMPLATE_FIELDS['email-template-body'],
    disabled: true,
  },
};
const REMIND_MODE = MODAL_TYPES.remind;

const ERROR_MESSAGE_TITLES = {
  [REMIND_MODE]: 'Could not send reminder email',
  [SAVE_TEMPLATE_MODE]: 'Could not save template',
};

const validateReminderEmails = (formData) => {
  const errorsDict = {};
  // const otherErrors = [];
  // Object.keys(REMINDER_EMAIL_TEMPLATE_FIELDS).forEach((fieldKey) => {
  //   const fieldError = validateEmailTemplateFieldsForForm(formData, fieldKey);
  //   if (fieldError) {
  //     errorsDict[fieldKey] = fieldError;
  //     otherErrors.push(fieldError);
  //   }
  //   // eslint-disable-next-line no-underscore-dangle
  //   console.log("FIELD ERRORS", fieldError)
  //   console.log("OTHER ERRORS", otherErrors)
  // });
  // if (otherErrors.length > 0) {
  //   // eslint-disable-next-line no-underscore-dangle
  //   errorsDict._errors = errorsDict;
  // }
  // console.log('ERRORS DICT', errorsDict);
  return errorsDict;
};

export class BaseCodeReminderModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.state = {
      mode: REMIND_MODE,
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

    if (mode === REMIND_MODE && submitSucceeded && submitSucceeded !== prevProps.submitSucceeded) {
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
      enableLearnerPortal,
      enterpriseSlug,
    } = this.props;
    this.setMode(REMIND_MODE);

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
    // If the enterprise has a learner portal, we should direct users to it in our assignment email
    if (enableLearnerPortal && configuration.ENTERPRISE_LEARNER_PORTAL_URL) {
      options.base_enterprise_url = `${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}`;
    }

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
      error,
    } = this.props;
    const { mode } = this.state;
    console.log('MODE', mode);
    console.log('SUBMIT FAILED', submitFailed)
    console.log('ERROR', error)
    const numberOfSelectedCodes = this.getNumberOfSelectedCodes();
    console.log('PROPS', this.props)
    return (
      <>
        {submitFailed && (
          <Fields
            title={ERROR_MESSAGE_TITLES[mode]}
            component={ModalError}
            names={Object.keys(REMINDER_EMAIL_TEMPLATE_FIELDS)}
            nonFieldErrors={error}
            ref={this.errorMessageRef}
          />
        )}
        <CodeDetails
          isBulkRemind={isBulkRemind}
          hasIndividualRemindData={this.hasIndividualRemindData()}
          data={data}
          numberOfSelectedCodes={numberOfSelectedCodes}
        />
        <EmailTemplateForm
          emailTemplateType={MODAL_TYPES.remind}
          fields={REMINDER_EMAIL_TEMPLATE_FIELDS}
        />
      </>
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
                {mode === REMIND_MODE && submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
                Remind
              </>
            </Button>,
            <SaveTemplateButton
              key="save-remind-template-btn"
              templateType={REMIND_MODE}
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

BaseCodeReminderModal.defaultProps = {
  error: null,
  isBulkRemind: false,
  data: {},
  selectedToggle: null,
  couponDetailsTable: {},
};

BaseCodeReminderModal.propTypes = {
  // props From redux-form
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  error: PropTypes.arrayOf(PropTypes.string),

  // from redux
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
  couponDetailsTable: PropTypes.shape({
    data: PropTypes.shape({
      count: PropTypes.number,
    }),
  }),
  initialValues: PropTypes.shape({}).isRequired,

  // custom props
  couponId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  sendCodeReminder: PropTypes.func.isRequired,
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
  validate: validateReminderEmails,
})(BaseCodeReminderModal);
