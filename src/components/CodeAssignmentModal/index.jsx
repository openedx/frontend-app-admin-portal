import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';
import isEmail from 'validator/lib/isEmail';

import H3 from '../H3';
import TextAreaAutoSize from '../TextAreaAutoSize';
import StatusAlert from '../StatusAlert';
import BulkAssignFields from './BulkAssignFields';
import IndividualAssignFields from './IndividualAssignFields';

import emailTemplate from './emailTemplate';
import { ONCE_PER_CUSTOMER, MULTI_USE } from '../../data/constants/coupons';

import './CodeAssignmentModal.scss';

class CodeAssignmentModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

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

    const errorMessageRef = this.errorMessageRef && this.errorMessageRef.current;

    if (submitSucceeded && submitSucceeded !== prevProps.submitSucceeded) {
      onClose();
    }

    if (submitFailed && error !== prevProps.error && errorMessageRef) {
      // When there is an new error, focus on the error message status alert
      errorMessageRef.focus();
    }
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

  validateBulkAssign(formData) {
    const { data: { unassignedCodes, couponType } } = this.props;

    const textAreaKey = 'email-addresses';
    const csvFileKey = 'csv-email-addresses';

    const textAreaEmails = formData[textAreaKey] && formData[textAreaKey].split('\n');
    const csvEmails = formData[csvFileKey];

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

    const invalidEmailsMessage = 'One or more email addresses is not valid. Please try again.';

    const errors = {
      _error: [],
    };

    /* eslint-disable no-underscore-dangle */
    if (!textAreaEmails && !csvEmails) {
      errors._error.push((
        'No email addresses provided. Either manually enter email addresses or upload a CSV file.'
      ));
    } else if (textAreaEmails && csvEmails) {
      errors._error.push((
        'You uploaded a CSV and manually entered email addresses. Please only use one of these fields.'
      ));
    } else if (textAreaEmails && !textAreaEmails.every(email => isEmail(email))) {
      errors[textAreaKey] = invalidEmailsMessage;
      errors._error.push(invalidEmailsMessage);
    } else if (textAreaEmails && textAreaEmails.length > unassignedCodes) {
      const message = getTooManyAssignmentsMessage({
        emails: textAreaEmails,
        numCodes: unassignedCodes,
      });

      errors[textAreaKey] = message;
      errors._error.push(message);
    } else if (
      textAreaEmails && numberOfSelectedCodes && shouldValidateSelectedCodes &&
      textAreaEmails.length > numberOfSelectedCodes
    ) {
      const message = getTooManyAssignmentsMessage({
        emails: textAreaEmails,
        numCodes: numberOfSelectedCodes,
        selected: true,
      });

      errors[textAreaKey] = message;
      errors._error.push(message);
    } else if (csvEmails && !csvEmails.every(email => isEmail(email))) {
      errors[csvFileKey] = invalidEmailsMessage;
      errors._error.push(invalidEmailsMessage);
    } else if (csvEmails && csvEmails.length > unassignedCodes) {
      const message = getTooManyAssignmentsMessage({
        isCsv: true,
        emails: csvEmails,
        numCodes: unassignedCodes,
      });

      errors[csvFileKey] = message;
      errors._error.push(message);
    } else if (
      csvEmails && numberOfSelectedCodes && shouldValidateSelectedCodes &&
      csvEmails.length > numberOfSelectedCodes
    ) {
      const message = getTooManyAssignmentsMessage({
        isCsv: true,
        emails: csvEmails,
        numCodes: numberOfSelectedCodes,
        selected: true,
      });

      errors[csvFileKey] = message;
      errors._error.push(message);
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
    const emailTemplateKey = 'email-template';

    let errors;

    if (isBulkAssign) {
      errors = this.validateBulkAssign(formData);
    } else {
      errors = this.validateIndividualAssign(formData);
    }

    /* eslint-disable no-underscore-dangle */
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
    } = this.props;

    // Validate form data
    this.validateFormData(formData);

    // Configure the options to send to the assignment API endpoint
    const options = {
      template: formData['email-template'],
    };

    if (isBulkAssign) {
      const hasTextAreaEmails = !!formData['email-addresses'];
      options.emails = hasTextAreaEmails ? formData['email-addresses'].split('\n') : formData['csv-email-addresses'];

      // Only includes `codes` in `options` if not all codes are selected.
      if (!hasAllCodesSelected) {
        options.codes = selectedCodes.map(selectedCode => selectedCode.code);
      }
    } else {
      options.emails = [formData['email-address']];
      options.codes = [code.code];
    }

    return sendCodeAssignment(couponId, options)
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
    } = this.props;

    const numberOfSelectedCodes = this.getNumberOfSelectedCodes();

    return (
      <React.Fragment>
        {submitFailed && this.renderErrorMessage()}
        <div className="assignment-details mb-4">
          {isBulkAssign && this.hasBulkAssignData() && (
            <React.Fragment>
              <p>Unassigned Codes: {data.unassignedCodes}</p>
              {numberOfSelectedCodes > 0 && <p>Selected Codes: {numberOfSelectedCodes}</p>}
            </React.Fragment>
          )}
          {!isBulkAssign && this.hasIndividualAssignData() && (
            <React.Fragment>
              <p>Code: {data.code.code}</p>
              <p className="code-remaining-uses">Remaining Uses: {data.remainingUses}</p>
            </React.Fragment>
          )}
        </div>
        <form onSubmit={e => e.preventDefault()}>
          {isBulkAssign && <BulkAssignFields />}
          {!isBulkAssign && <IndividualAssignFields />}

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
          title="Unable to assign codes"
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
        <small>Code Assignment</small>
      </React.Fragment>
    );
  }

  render() {
    const {
      isBulkAssign,
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
              className="btn-primary"
              disabled={submitting}
              onClick={handleSubmit(this.handleModalSubmit)}
            >
              <React.Fragment>
                {submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
                {`Assign ${isBulkAssign ? 'Codes' : 'Code'}`}
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

CodeAssignmentModal.defaultProps = {
  error: null,
  isBulkAssign: false,
  data: {},
};

CodeAssignmentModal.propTypes = {
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
  couponDetailsTable: PropTypes.shape({
    data: PropTypes.shape({
      count: PropTypes.number,
    }),
  }).isRequired,
  isBulkAssign: PropTypes.bool,
  data: PropTypes.shape({}),
};

export default reduxForm({
  form: 'code-assignment-modal-form',
  initialValues: {
    'email-template': emailTemplate,
  },

})(CodeAssignmentModal);
