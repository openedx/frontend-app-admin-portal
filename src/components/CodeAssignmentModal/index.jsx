import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import {
  Button, Input, Icon, Modal,
} from '@edx/paragon';
import isEmail from 'validator/lib/isEmail';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import TextAreaAutoSize from '../TextAreaAutoSize';
import RenderField from '../RenderField';
import StatusAlert from '../StatusAlert';
import BulkAssignFields from './BulkAssignFields';
import IndividualAssignFields from './IndividualAssignFields';
import SaveTemplateButton from '../../containers/SaveTemplateButton';
import TemplateSourceFields from '../../containers/TemplateSourceFields';
import IconWithTooltip from '../IconWithTooltip';

import { validateEmailTemplateFields } from '../../utils';
import { ONCE_PER_CUSTOMER, MULTI_USE, CSV_HEADER_NAME } from '../../data/constants/coupons';
import { EMAIL_ADDRESS_TEXT_FORM_DATA, EMAIL_ADDRESS_CSV_FORM_DATA } from '../../data/constants/addUsers';

import './CodeAssignmentModal.scss';
import { configuration } from '../../config';

class BaseCodeAssignmentModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.state = {
      mode: 'assign',
    };

    this.setMode = this.setMode.bind(this);
    this.validateFormData = this.validateFormData.bind(this);
    this.handleModalSubmit = this.handleModalSubmit.bind(this);
    this.getNumberOfSelectedCodes = this.getNumberOfSelectedCodes.bind(this);
    this.autoReminderField = this.autoReminderField.bind(this);
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

    if (mode === 'assign' && submitSucceeded && submitSucceeded !== prevProps.submitSucceeded) {
      onClose();
    }

    if (submitFailed && error !== prevProps.error && errorMessageRef) {
      // When there is an new error, focus on the error message status alert
      errorMessageRef.focus();
    }
  }

  componentWillUnmount() {
    this.props.setEmailAddress('', 'assign');
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

    const textAreaKey = EMAIL_ADDRESS_TEXT_FORM_DATA;
    const csvFileKey = EMAIL_ADDRESS_CSV_FORM_DATA;

    const textAreaEmails = formData[textAreaKey] && formData[textAreaKey].split(/\r\n|\n/);
    const csvEmails = formData[csvFileKey];
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

    const getTooManyAssignmentsMessage = ({
      isCsv = false,
      emails,
      numCodes,
      selected,
    }) => {
      let message = `You have ${numCodes}`;

      message += ` ${numCodes > 1 ? 'codes' : 'code'}`;
      message += ` ${selected ? 'selected' : 'remaining'}`;
      message += `, but ${isCsv ? 'your file has' : 'you entered'}`;
      message += ` ${emails.length} emails. Please try again.`;

      return message;
    };

    const getInvalidEmailMessage = (invalidEmailIndices, emails) => {
      const firstInvalidIndex = invalidEmailIndices.shift();
      const invalidEmail = emails[firstInvalidIndex];
      const message = `Email address ${invalidEmail} on line ${firstInvalidIndex + 1} is invalid. Please try again.`;
      return message;
    };

    const errors = {
      _error: [],
    };

    /* eslint-disable no-underscore-dangle */
    if (invalidTextAreaEmails.length > 0) {
      const invalidEmailMessage = getInvalidEmailMessage(invalidTextAreaEmails, textAreaEmails);
      errors[textAreaKey] = invalidEmailMessage;
      errors._error.push(invalidEmailMessage);
    } else if (validTextAreaEmails.length > unassignedCodes) {
      const message = getTooManyAssignmentsMessage({
        emails: validTextAreaEmails,
        numCodes: unassignedCodes,
      });
      errors[textAreaKey] = message;
      errors._error.push(message);
    } else if (
      numberOfSelectedCodes && shouldValidateSelectedCodes
      && validTextAreaEmails.length > numberOfSelectedCodes
    ) {
      const message = getTooManyAssignmentsMessage({
        emails: validTextAreaEmails,
        numCodes: numberOfSelectedCodes,
        selected: true,
      });
      errors[textAreaKey] = message;
      errors._error.push(message);
    } else if (invalidCsvEmails.length > 0) {
      const invalidEmailMessage = getInvalidEmailMessage(invalidCsvEmails, csvEmails);
      errors[csvFileKey] = invalidEmailMessage;
      errors._error.push(invalidEmailMessage);
    } else if (validCsvEmails.length > unassignedCodes) {
      const message = getTooManyAssignmentsMessage({
        isCsv: true,
        emails: validCsvEmails,
        numCodes: unassignedCodes,
      });
      errors[csvFileKey] = message;
      errors._error.push(message);
    } else if (
      numberOfSelectedCodes && shouldValidateSelectedCodes
      && validCsvEmails.length > numberOfSelectedCodes
    ) {
      const message = getTooManyAssignmentsMessage({
        isCsv: true,
        emails: validCsvEmails,
        numCodes: numberOfSelectedCodes,
        selected: true,
      });
      errors[csvFileKey] = message;
      errors._error.push(message);
    } else if (validTextAreaEmails.length === 0 && validCsvEmails.length === 0) {
      errors._error.push((
        'No email addresses provided. Either manually enter email addresses or upload a CSV file.'
      ));
    } else if (validTextAreaEmails.length > 0 && validCsvEmails.length > 0) {
      errors._error.push((
        'You uploaded a CSV and manually entered email addresses. Please only use one of these fields.'
      ));
    }
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
    const emailTemplateKey = 'email-template-body';
    let errors;

    if (isBulkAssign) {
      errors = this.validateBulkAssign(formData);
    } else {
      errors = this.validateIndividualAssign(formData);
    }

    /* eslint-disable no-underscore-dangle */
    const emailFieldErrors = validateEmailTemplateFields(formData);

    // combine errors
    errors = {
      ...errors,
      ...emailFieldErrors,
      _error: [...errors._error, ...emailFieldErrors._error],
    };

    if (!formData[emailTemplateKey]) {
      const message = 'An email template is required.';
      errors[emailTemplateKey] = message;
      errors._error.push(message);
    }

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

    this.setMode('assign');

    // Validate form data
    this.validateFormData(formData);
    // Configure the options to send to the assignment API endpoint
    const options = {
      template: formData['email-template-body'],
      template_subject: formData['email-template-subject'],
      template_greeting: formData['email-template-greeting'],
      template_closing: formData['email-template-closing'],
      enable_nudge_emails: formData['enable-nudge-emails'],
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
      options.emails = validEmails;

      // Only includes `codes` in `options` if not all codes are selected.
      if (!hasAllCodesSelected) {
        options.codes = selectedCodes.map(selectedCode => selectedCode.code);
      }
    } else {
      options.emails = [formData['email-address']];
      options.codes = [code.code];
    }

    let pendingEnterpriseUserData;
    if (hasTextAreaEmails) {
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

    return createPendingEnterpriseUsers(pendingEnterpriseUserData)
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

  autoReminderField({ input }) {
    return (
      <div className="auto-reminder-wrapper">
        <label className="ml-4">
          <Input
            {...input}
            type="checkbox"
            checked={input.value}
            id="autoReminderCheckbox"
          />
          Automate reminders
        </label>
        <IconWithTooltip
          icon={faInfoCircle}
          altText="More information"
          tooltipText="edX will remind learners to redeem their code 3, 10, and 19 days after you assign it."
        />
      </div>
    );
  }

  renderBody() {
    const {
      data,
      isBulkAssign,
      submitFailed,
    } = this.props;

    const numberOfSelectedCodes = this.getNumberOfSelectedCodes();

    return (
      <>
        {submitFailed && this.renderErrorMessage()}
        <div className="assignment-details mb-4">
          {isBulkAssign && this.hasBulkAssignData() && (
            <>
              <p>Unassigned Codes: {data.unassignedCodes}</p>
              {numberOfSelectedCodes > 0 && <p>Selected Codes: {numberOfSelectedCodes}</p>}
            </>
          )}
          {!isBulkAssign && this.hasIndividualAssignData() && (
            <>
              <p>Code: {data.code.code}</p>
              <p className="code-remaining-uses">Remaining Uses: {data.remainingUses}</p>
            </>
          )}
        </div>
        <form onSubmit={e => e.preventDefault()}>
          {isBulkAssign && <BulkAssignFields />}
          {!isBulkAssign && <IndividualAssignFields />}
          <div className="mt-4">
            <h3>Email Template</h3>
            <TemplateSourceFields emailTemplateType="assign" currentEmail={this.props.currentEmail} />
            <Field
              id="email-template-subject"
              name="email-template-subject"
              component={RenderField}
              type="text"
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
            <Field
              name="enable-nudge-emails"
              component={this.autoReminderField}
            />
          </div>
        </form>
      </>
    );
  }

  renderErrorMessage() {
    const modeErrors = {
      assign: 'Unable to assign codes',
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
            >
              <>
                {mode === 'assign' && submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
                {`Assign ${isBulkAssign ? 'Codes' : 'Code'}`}
              </>
            </Button>,
            <SaveTemplateButton
              key="save-assign-template-btn"
              templateType="assign"
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

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
});

const CodeAssignmentModal = connect(mapStateToProps)(BaseCodeAssignmentModal);

export default reduxForm({
  form: 'code-assignment-modal-form',
})(CodeAssignmentModal);
