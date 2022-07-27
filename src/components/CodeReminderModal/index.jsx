import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';
import SaveTemplateButton from '../../containers/SaveTemplateButton';

import { EMAIL_TEMPLATE_SUBJECT_KEY } from '../../data/constants/emailTemplate';
import { validateEmailTemplateForm } from '../../data/validation/email';
import ModalError from '../CodeModal/ModalError';
import { configuration, features } from '../../config';
import './CodeReminderModal.scss';
import CodeDetails from './CodeDetails';
import EmailTemplateForm, { EMAIL_TEMPLATE_FIELDS } from '../EmailTemplateForm';
import { EMAIL_TEMPLATE_FILES_ID, MODAL_TYPES } from '../EmailTemplateForm/constants';
import { appendUserCodeDetails } from '../CodeModal';

const REMINDER_EMAIL_TEMPLATE_FIELDS = {
  ...EMAIL_TEMPLATE_FIELDS,
  'email-template-body': {
    ...EMAIL_TEMPLATE_FIELDS['email-template-body'],
    disabled: true,
  },
};
const REMIND_MODE = MODAL_TYPES.remind;

const ERROR_MESSAGE_TITLES = {
  [MODAL_TYPES.remind]: 'Could not send reminder email',
  [MODAL_TYPES.save]: 'Could not save template',
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
      ...(features.FILE_ATTACHMENT && {
        template_files: formData[EMAIL_TEMPLATE_FILES_ID],
      }),
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
    } else {
      const assignments = [];
      if (isBulkRemind && data.selectedCodes.length) {
        const remindCodeEmails = [];
        data.selectedCodes.map(code => (
          remindCodeEmails.push(code.assigned_to)
        ));

        data.selectedCodes.forEach((code) => {
          appendUserCodeDetails(code.assigned_to, code.code, assignments);
        });
        options.assignments = assignments;
      } else {
        appendUserCodeDetails(data.email, data.code, assignments);
        options.assignments = assignments;
      }
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

    const numberOfSelectedCodes = this.getNumberOfSelectedCodes();

    return (
      <>
        {submitFailed && (
          <ModalError
            title={ERROR_MESSAGE_TITLES[mode]}
            errors={error}
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
})(BaseCodeReminderModal);
