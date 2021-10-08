import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, SubmissionError } from 'redux-form';
import {
  Button, Icon, Modal, Form,
} from '@edx/paragon';
import isEmail from 'validator/lib/isEmail';

import BulkAssignFields from './BulkAssignFields';
import IndividualAssignFields from './IndividualAssignFields';
import SaveTemplateButton from '../../containers/SaveTemplateButton';

import { validateEmailTemplateFields } from '../../data/validation/email';
import { ONCE_PER_CUSTOMER, MULTI_USE, CSV_HEADER_NAME } from '../../data/constants/coupons';
import { EMAIL_ADDRESS_TEXT_FORM_DATA, EMAIL_ADDRESS_CSV_FORM_DATA } from '../../data/constants/addUsers';
import { EMAIL_TEMPLATE_SUBJECT_KEY } from '../../data/constants/emailTemplate';

import './CodeAssignmentModal.scss';
import { configuration, features } from '../../config';
import {
  displayCode, displaySelectedCodes, ModalError,
} from '../CodeModal';
import {
  EMAIL_TEMPLATE_BODY_ID, EMAIL_TEMPLATE_CLOSING_ID, EMAIL_TEMPLATE_GREETING_ID, EMAIL_TEMPLATE_FILES_ID, MODAL_TYPES,
} from '../EmailTemplateForm/constants';
import EmailTemplateForm from '../EmailTemplateForm';
import {
  EMAIL_TEMPLATE_NUDGE_EMAIL_ID,
  ASSIGNMENT_ERROR_TITLES,
  ASSIGNMENT_MODAL_FIELDS,
  NOTIFY_LEARNERS_CHECKBOX_TEST_ID,
  SUBMIT_BUTTON_TEST_ID,
} from './constants';
import { getErrors } from './validation';

export class BaseCodeAssignmentModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.state = {
      mode: MODAL_TYPES.assign,
      notify: true,
    };

    this.setMode = this.setMode.bind(this);
    this.setNotify = this.setNotify.bind(this);
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
    const {
      mode,
    } = this.state;

    const errorMessageRef = this.errorMessageRef && this.errorMessageRef.current;

    if (mode === MODAL_TYPES.assign && submitSucceeded && submitSucceeded !== prevProps.submitSucceeded) {
      onClose();
    }

    if (submitFailed && error !== prevProps.error && errorMessageRef) {
      // When there is an new error, focus on the error message status alert
      errorMessageRef.focus();
    }
  }

  componentWillUnmount() {
    this.props.setEmailAddress('', MODAL_TYPES.assign);
  }

  getNumberOfSelectedCodes() {
    const {
      data: {
        selectedCodes,
        hasAllCodesSelected,
      },
      couponDetailsTable: { data: tableData },
    } = this.props;

    const numberOfSelectedCodes = selectedCodes ? selectedCodes.length : 0;

    return hasAllCodesSelected ? tableData.count : numberOfSelectedCodes;
  }

  setMode(mode) {
    this.setState({ mode });
  }

  setNotify() {
    this.setState(prevState => ({ notify: !prevState.notify }));
  }

  usersEmail(emails) {
    const users = [];
    emails.forEach((email) => {
      users.push({
        email,
      });
    });
    return users;
  }

  validateEmailAddresses(emails, isCSV = false) {
    let learnerEmails = emails;
    const result = {
      validEmails: [],
      invalidEmailIndices: [],
    };
    let offset = 0;
    if (!learnerEmails) {
      return result;
    }
    // if csv and header is present then remove header and
    // set offset to calculate correct line numbers
    if (isCSV) {
      // first row/line in csv will be considered as header if and only if text is `emails`
      const hasHeader = !isEmail(learnerEmails[0]) && learnerEmails[0] === CSV_HEADER_NAME;
      learnerEmails = hasHeader ? learnerEmails.slice(1) : learnerEmails;
      offset = hasHeader ? 1 : 0;
    }
    learnerEmails.forEach((email, index) => {
      if (email) {
        const isValidEmail = isEmail(email);
        if (!isValidEmail) {
          result.invalidEmailIndices.push(index + offset);
        } else {
          result.validEmails.push(email);
        }
      }
    });
    return result;
  }

  validateBulkAssign(formData) {
    const { data: { unassignedCodes, couponType } } = this.props;

    const textAreaEmails = formData[EMAIL_ADDRESS_TEXT_FORM_DATA] && formData[EMAIL_ADDRESS_TEXT_FORM_DATA].split(/\r\n|\n/);
    const csvEmails = formData[EMAIL_ADDRESS_CSV_FORM_DATA];
    const {
      validEmails: validTextAreaEmails,
      invalidEmailIndices: invalidTextAreaEmails,
    } = this.validateEmailAddresses(textAreaEmails);
    const {
      validEmails: validCsvEmails,
      invalidEmailIndices: invalidCsvEmails,
    } = this.validateEmailAddresses(csvEmails, true);

    const numberOfSelectedCodes = this.getNumberOfSelectedCodes();
    const shouldValidateSelectedCodes = ![ONCE_PER_CUSTOMER, MULTI_USE].includes(couponType);

    const errors = getErrors({
      unassignedCodes,
      validTextAreaEmails,
      invalidTextAreaEmails,
      validCsvEmails,
      invalidCsvEmails,
      numberOfSelectedCodes,
      shouldValidateSelectedCodes,
    });
    /* eslint-enable no-underscore-dangle */

    return errors;
  }

  validateIndividualAssign(formData) {
    const inputKey = 'email-address';
    const emailAddress = formData[inputKey];

    const errors = {
      _error: [],
    };

    /* eslint-disable no-underscore-dangle */
    if (!emailAddress) {
      const message = 'No email address provided. Please enter a valid email address.';
      errors[inputKey] = message;
      errors._error.push(message);
    } else if (emailAddress && !isEmail(emailAddress)) {
      const message = 'The email address is not valid. Please try again.';
      errors[inputKey] = message;
      errors._error.push(message);
    }
    /* eslint-enable no-underscore-dangle */

    return errors;
  }

  validateFormData(formData) {
    const { isBulkAssign } = this.props;
    const emailTemplateKey = EMAIL_TEMPLATE_BODY_ID;
    let errors;

    if (isBulkAssign) {
      errors = this.validateBulkAssign(formData);
    } else {
      errors = this.validateIndividualAssign(formData);
    }

    /* eslint-disable no-underscore-dangle */
    const emailFieldErrors = validateEmailTemplateFields(formData, emailTemplateKey);

    // combine errors
    errors = {
      ...errors,
      ...emailFieldErrors,
      _error: [...errors._error, ...emailFieldErrors._error],
    };

    if (Object.keys(errors) > 1 || errors._error.length > 0) {
      throw new SubmissionError(errors);
    }
    /* eslint-enable no-underscore-dangle */
  }

  hasBulkAssignData() {
    const { data } = this.props;
    return ['unassignedCodes', 'selectedCodes'].every(key => key in data);
  }

  hasIndividualAssignData() {
    const { data } = this.props;
    return ['code', 'remainingUses'].every(key => key in data);
  }

  handleModalSubmit(formData) {
    const {
      isBulkAssign,
      couponId,
      data: {
        code,
        selectedCodes,
        hasAllCodesSelected,
      },
      sendCodeAssignment,
      createPendingEnterpriseUsers,
      enableLearnerPortal,
      enterpriseSlug,
      enterpriseUuid,
    } = this.props;

    this.setMode(MODAL_TYPES.assign);

    const { notify } = this.state;

    // Validate form data
    this.validateFormData(formData);
    // Configure the options to send to the assignment API endpoint
    const options = {
      template: formData[EMAIL_TEMPLATE_BODY_ID],
      template_subject: formData[EMAIL_TEMPLATE_SUBJECT_KEY],
      template_greeting: formData[EMAIL_TEMPLATE_GREETING_ID],
      template_closing: formData[EMAIL_TEMPLATE_CLOSING_ID],
      ...(features.FILE_ATTACHMENT && {
        template_files: formData[EMAIL_TEMPLATE_FILES_ID],
      }),
      enable_nudge_emails: formData[EMAIL_TEMPLATE_NUDGE_EMAIL_ID],
      notify_learners: notify,
    };
    // If the enterprise has a learner portal, we should direct users to it in our assignment email
    if (enableLearnerPortal && configuration.ENTERPRISE_LEARNER_PORTAL_URL) {
      options.base_enterprise_url = `${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}`;
    }

    if (formData['template-id']) {
      options.template_id = formData['template-id'];
    }

    const hasTextAreaEmails = !!formData[EMAIL_ADDRESS_TEXT_FORM_DATA];
    const emails = hasTextAreaEmails ? formData[EMAIL_ADDRESS_TEXT_FORM_DATA].split(/\r\n|\n/) : formData[EMAIL_ADDRESS_CSV_FORM_DATA];
    const { validEmails } = this.validateEmailAddresses(emails, !hasTextAreaEmails);

    if (isBulkAssign) {
      // Only includes `codes` in `options` if not all codes are selected.
      if (!hasAllCodesSelected) {
        options.codes = selectedCodes.map(selectedCode => selectedCode.code);
      }
    } else {
      options.codes = [code.code];
    }

    let pendingEnterpriseUserData;
    if (validEmails) {
      pendingEnterpriseUserData = validEmails.map((email) => ({
        user_email: email,
        enterprise_customer: enterpriseUuid,
      }));
    } else {
      pendingEnterpriseUserData = {
        user_email: formData['email-address'],
        enterprise_customer: enterpriseUuid,
      };
    }
    const assignmentEmails = isBulkAssign ? validEmails : [formData['email-address']];
    options.users = this.usersEmail(assignmentEmails);

    return createPendingEnterpriseUsers(pendingEnterpriseUserData, enterpriseUuid)
      .then(() => sendCodeAssignment(couponId, options))
      .then((response) => {
        this.props.onSuccess(response);
      })
      .catch((error) => {
        const { response, message } = error;
        const nonFieldErrors = response && response.data && response.data.non_field_errors;

        let errors = [message];

        if (nonFieldErrors) {
          errors = [errors, ...nonFieldErrors];
        }

        throw new SubmissionError({
          _error: errors,
        });
      });
  }

  renderBody() {
    const {
      data,
      isBulkAssign,
      submitFailed,
      error,
    } = this.props;

    const { mode, notify } = this.state;
    const numberOfSelectedCodes = this.getNumberOfSelectedCodes();

    return (
      <>
        {submitFailed && <ModalError title={ASSIGNMENT_ERROR_TITLES[mode]} errors={error} ref={this.errorMessageRef} />}
        <div className="assignment-details mb-4">
          {isBulkAssign && this.hasBulkAssignData() && (
            <>
              <p>Unassigned codes: {data.unassignedCodes}</p>
              {numberOfSelectedCodes > 0 && <p>{displaySelectedCodes(numberOfSelectedCodes)}</p>}
            </>
          )}
          {!isBulkAssign && this.hasIndividualAssignData() && (
            <>
              <p>{displayCode(data.code.code)}</p>
              <p className="code-remaining-uses">Remaining Uses: {data.remainingUses}</p>
            </>
          )}
        </div>
        <form onSubmit={e => e.preventDefault()}>
          {isBulkAssign && <BulkAssignFields />}
          {!isBulkAssign && <IndividualAssignFields />}
        </form>
        <div className="mt-4">
          <Form.Checkbox
            checked={notify}
            onChange={this.setNotify}
            data-testid={NOTIFY_LEARNERS_CHECKBOX_TEST_ID}
          >
            Notify learners by email
          </Form.Checkbox>
          { notify && (
            <EmailTemplateForm
              emailTemplateType={MODAL_TYPES.assign}
              fields={ASSIGNMENT_MODAL_FIELDS}
              currentEmail={this.props.currentEmail}
            />
          )}
        </div>

      </>
    );
  }

  renderTitle() {
    return this.props.title;
  }

  render() {
    const {
      isBulkAssign,
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
          dialogClassName="code-assignment"
          title={this.renderTitle()}
          body={this.renderBody()}
          buttons={[
            <Button
              key="assign-submit-btn"
              disabled={submitting}
              onClick={handleSubmit(this.handleModalSubmit)}
              data-testid={SUBMIT_BUTTON_TEST_ID}
            >
              <>
                {mode === MODAL_TYPES.assign && submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
                {`Assign ${isBulkAssign ? 'Codes' : 'Code'}`}
              </>
            </Button>,
            <SaveTemplateButton
              key="save-assign-template-btn"
              templateType={MODAL_TYPES.assign}
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

BaseCodeAssignmentModal.defaultProps = {
  error: null,
  isBulkAssign: false,
  data: {},
  currentEmail: '',
};

BaseCodeAssignmentModal.propTypes = {
  // props from redux
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseUuid: PropTypes.string.isRequired,
  currentEmail: PropTypes.string,
  enableLearnerPortal: PropTypes.bool.isRequired,
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
  sendCodeAssignment: PropTypes.func.isRequired,
  createPendingEnterpriseUsers: PropTypes.func.isRequired,
  setEmailAddress: PropTypes.func.isRequired,
  couponDetailsTable: PropTypes.shape({
    data: PropTypes.shape({
      count: PropTypes.number,
    }),
  }).isRequired,
  initialValues: PropTypes.shape({}).isRequired,
  isBulkAssign: PropTypes.bool,
  data: PropTypes.shape({
    code: PropTypes.shape({
      code: PropTypes.string,
    }),
    selectedCodes: PropTypes.arrayOf(PropTypes.shape({})),
    hasAllCodesSelected: PropTypes.bool,
    couponType: PropTypes.string,
    unassignedCodes: PropTypes.number,
    remainingUses: PropTypes.number,
  }),
};

export default reduxForm({
  form: 'code-assignment-modal-form',
})(BaseCodeAssignmentModal);
