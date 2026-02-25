import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { reduxForm, SubmissionError } from 'redux-form';
import {
  Button, ModalDialog, ActionRow, Form, Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

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
  NOTIFY_LEARNERS_CHECKBOX_TEST_ID,
  SUBMIT_BUTTON_TEST_ID,
  getAssignmentModalFields,
} from './constants';
import { getErrors } from './validation';

export const BaseCodeAssignmentModal = (props) => {
  const {
    submitFailed,
    submitSucceeded,
    onClose,
    error,
    setEmailAddress,
    isBulkAssign,
    couponId,
    data = {},
    sendCodeAssignment,
    createPendingEnterpriseUsers,
    enableLearnerPortal,
    enterpriseSlug,
    enterpriseUuid,
    couponDetailsTable,
    currentEmail,
    handleSubmit,
    submitting,
    title,
  } = props;

  const { formatMessage } = useIntl();

  const {
    code,
    selectedCodes,
    hasAllCodesSelected,
  } = data;

  const errorMessageRef = useRef();
  const [mode, setMode] = useState(MODAL_TYPES.assign);
  const [notify, setNotify] = useState(true);

  useEffect(() => {
    const errorMessageElement = errorMessageRef.current;

    if (mode === MODAL_TYPES.assign && submitSucceeded) {
      onClose();
    }

    if (submitFailed && error && errorMessageElement) {
      errorMessageElement.focus();
    }
  }, [submitSucceeded, submitFailed, error, mode, onClose]);

  useEffect(() => () => {
    setEmailAddress('', MODAL_TYPES.assign);
  }, [setEmailAddress]);

  const handleModeSet = useCallback((newMode) => {
    setMode(newMode);
  }, []);

  const handleNotifyToggle = useCallback(() => {
    setNotify(prevNotify => !prevNotify);
  }, []);

  const getNumberOfSelectedCodes = useCallback(() => {
    const numberOfSelectedCodes = selectedCodes ? selectedCodes.length : 0;
    return hasAllCodesSelected ? couponDetailsTable?.data?.count : numberOfSelectedCodes;
  }, [selectedCodes, hasAllCodesSelected, couponDetailsTable]);

  const usersEmail = useCallback((emails) => {
    const users = [];
    emails.forEach((email) => {
      users.push({
        email,
      });
    });
    return users;
  }, []);

  const validateEmailAddresses = useCallback((emails, isCSV = false) => {
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
  }, []);

  const validateBulkAssign = useCallback((formData) => {
    const { unassignedCodes, couponType } = data;

    const textAreaEmails = formData[EMAIL_ADDRESS_TEXT_FORM_DATA] && formData[EMAIL_ADDRESS_TEXT_FORM_DATA].split(/\r\n|\n/);
    const csvEmails = formData[EMAIL_ADDRESS_CSV_FORM_DATA];
    const {
      validEmails: validTextAreaEmails,
      invalidEmailIndices: invalidTextAreaEmails,
    } = validateEmailAddresses(textAreaEmails);
    const {
      validEmails: validCsvEmails,
      invalidEmailIndices: invalidCsvEmails,
    } = validateEmailAddresses(csvEmails, true);

    const numberOfSelectedCodes = getNumberOfSelectedCodes();
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
  }, [data, validateEmailAddresses, getNumberOfSelectedCodes]);

  const validateIndividualAssign = useCallback((formData) => {
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
  }, []);

  const validateFormData = useCallback((formData) => {
    const emailTemplateKey = EMAIL_TEMPLATE_BODY_ID;
    let errors;

    if (isBulkAssign) {
      errors = validateBulkAssign(formData);
    } else {
      errors = validateIndividualAssign(formData);
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
  }, [isBulkAssign, validateBulkAssign, validateIndividualAssign]);

  const handleModalSubmit = useCallback((formData) => {
    handleModeSet(MODAL_TYPES.assign);

    // Validate form data
    validateFormData(formData);
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
    const { validEmails } = validateEmailAddresses(emails, !hasTextAreaEmails);

    if (isBulkAssign) {
      // Only includes `codes` in `options` if not all codes are selected.
      if (!hasAllCodesSelected) {
        options.codes = selectedCodes.map(selectedCode => selectedCode.code);
      }
    } else {
      options.codes = [code.code];
    }

    let pendingEnterpriseUserData;
    if (validEmails.length) {
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
    options.users = usersEmail(assignmentEmails);

    return createPendingEnterpriseUsers(pendingEnterpriseUserData, enterpriseUuid)
      .then(() => sendCodeAssignment(couponId, options))
      .then((response) => {
        props.onSuccess(response);
      })
      .catch((errorResponse) => {
        const { response, message } = errorResponse;
        const nonFieldErrors = response && response.data && response.data.non_field_errors;

        let errors = [message];

        if (nonFieldErrors) {
          errors = [errors, ...nonFieldErrors];
        }

        throw new SubmissionError({
          _error: errors,
        });
      });
  }, [
    handleModeSet,
    validateFormData,
    notify,
    enableLearnerPortal,
    enterpriseSlug,
    validateEmailAddresses,
    isBulkAssign,
    hasAllCodesSelected,
    selectedCodes,
    code,
    usersEmail,
    createPendingEnterpriseUsers,
    enterpriseUuid,
    sendCodeAssignment,
    couponId,
    props,
  ]);

  const hasBulkAssignData = useCallback(() => (
    ['unassignedCodes', 'selectedCodes'].every(key => key in data)
  ), [data]);

  const hasIndividualAssignData = useCallback(() => (
    ['code', 'remainingUses'].every(key => key in data)
  ), [data]);

  const renderBody = () => {
    const numberOfSelectedCodes = getNumberOfSelectedCodes();

    return (
      <>
        {submitFailed && <ModalError title={ASSIGNMENT_ERROR_TITLES[mode]} errors={error} ref={errorMessageRef} />}
        <div className="assignment-details mb-4">
          {isBulkAssign && hasBulkAssignData() && (
            <>
              <p>Unassigned codes: {data.unassignedCodes}</p>
              {numberOfSelectedCodes > 0 && <p>{displaySelectedCodes(numberOfSelectedCodes)}</p>}
            </>
          )}
          {!isBulkAssign && hasIndividualAssignData() && (
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
            onChange={handleNotifyToggle}
            data-testid={NOTIFY_LEARNERS_CHECKBOX_TEST_ID}
          >
            Notify learners by email
          </Form.Checkbox>
          {notify && (
            <EmailTemplateForm
              emailTemplateType={MODAL_TYPES.assign}
              fields={getAssignmentModalFields(formatMessage)}
              currentEmail={currentEmail}
            />
          )}
        </div>

      </>
    );
  };

  const renderTitle = () => title;

  return (
    <ModalDialog
      isOpen
      size="lg"
      onClose={onClose}
      className="code-assignment"
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {renderTitle()}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {renderBody()}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="link">
            Cancel
          </ModalDialog.CloseButton>
          <Button
            key="assign-submit-btn"
            disabled={submitting}
            onClick={handleSubmit(handleModalSubmit)}
            data-testid={SUBMIT_BUTTON_TEST_ID}
          >
            <>
              {mode === MODAL_TYPES.assign && submitting && <Spinner animation="border" className="mr-2" variant="light" size="sm" />}
              {`Assign ${isBulkAssign ? 'Codes' : 'Code'}`}
            </>
          </Button>,
          <SaveTemplateButton
            key="save-assign-template-btn"
            templateType={MODAL_TYPES.assign}
            setMode={handleModeSet}
            handleSubmit={handleSubmit}
          />,
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

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
