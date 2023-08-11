import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import {
  Button, Modal, Spinner,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

import SaveTemplateButton from '../../containers/SaveTemplateButton';

import { validateEmailTemplateForm } from '../../data/validation/email';
import { EMAIL_TEMPLATE_SUBJECT_KEY } from '../../data/constants/emailTemplate';
import {
  EMAIL_TEMPLATE_BODY_ID, EMAIL_TEMPLATE_CLOSING_ID, EMAIL_TEMPLATE_GREETING_ID, MODAL_TYPES, EMAIL_TEMPLATE_FILES_ID,
} from '../EmailTemplateForm/constants';
import {
  appendUserCodeDetails, displayCode, displayEmail, displaySelectedCodes, ModalError,
} from '../CodeModal';
import EmailTemplateForm from '../EmailTemplateForm';
import CheckboxWithTooltip from '../ReduxFormCheckbox/CheckboxWithTooltip';
import { configuration, features } from '../../config';

const ERROR_MESSAGE_TITLES = {
  [MODAL_TYPES.revoke]: 'Unable to revoke code(s)',
  [MODAL_TYPES.save]: 'Unable to save template',
};

class CodeRevokeModal extends React.Component {
  constructor(props) {
    super(props);

    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.state = {
      mode: MODAL_TYPES.revoke,
      doNotEmail: false,
    };

    this.setMode = this.setMode.bind(this);
    this.setDoNotEmail = this.setDoNotEmail.bind(this);
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

    if (mode === MODAL_TYPES.revoke && submitSucceeded && submitSucceeded !== prevProps.submitSucceeded) {
      onClose();
    }

    if (submitFailed && error !== prevProps.error && errorMessageRef) {
      // When there is an new error, focus on the error message status alert
      errorMessageRef.focus();
    }
  }

  handleModalSubmit(formData) {
    const {
      couponId,
      isBulkRevoke,
      data,
      sendCodeRevoke,
      enterpriseSlug,
      enableLearnerPortal,
    } = this.props;

    const { doNotEmail } = this.state;

    /* eslint-disable no-underscore-dangle */
    const errors = {
      _error: [],
    };
    const emailTemplateKey = EMAIL_TEMPLATE_BODY_ID;

    this.setMode(MODAL_TYPES.revoke);

    // Validate form data
    validateEmailTemplateForm(formData, emailTemplateKey);

    const options = {
      template: formData[emailTemplateKey],
      template_subject: formData[EMAIL_TEMPLATE_SUBJECT_KEY],
      template_greeting: formData[EMAIL_TEMPLATE_GREETING_ID],
      template_closing: formData[EMAIL_TEMPLATE_CLOSING_ID],
      ...(features.FILE_ATTACHMENT && {
        template_files: formData[EMAIL_TEMPLATE_FILES_ID],
      }),
      do_not_email: doNotEmail,
    };

    // If the enterprise has a learner portal, we should direct users to it in our revoke email
    if (enableLearnerPortal && configuration.ENTERPRISE_LEARNER_PORTAL_URL) {
      options.base_enterprise_url = `${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}`;
    }

    if (formData['template-id']) {
      options.template_id = formData['template-id'];
    }

    const assignments = [];

    if (isBulkRevoke) {
      if (!data.selectedCodes.length) {
        errors._error.push('At least one code must be selected.');
        throw new SubmissionError(errors);
      }

      const revokeCodeEmails = [];
      data.selectedCodes.map(code => (
        revokeCodeEmails.push(code.assigned_to)
      ));
      data.selectedCodes.forEach((code) => {
        appendUserCodeDetails(code.assigned_to, code.code, assignments);
      });

      options.assignments = assignments;
    } else {
      appendUserCodeDetails(data.assigned_to, data.code, assignments);
      options.assignments = assignments;
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

  setMode(mode) {
    this.setState({ mode });
  }

  setDoNotEmail(doNotEmail) {
    this.setState({ doNotEmail });
  }

  hasIndividualRevokeData() {
    const { data } = this.props;
    return ['code', 'assigned_to'].every(key => key in data);
  }

  renderBody() {
    const {
      data,
      isBulkRevoke,
      submitFailed,
      error,
    } = this.props;

    const { doNotEmail, mode } = this.state;

    return (
      <>
        {submitFailed
          && (
          <ModalError
            title={ERROR_MESSAGE_TITLES[mode]}
            errors={error}
            ref={this.errorMessageRef}
          />
          )}
        <div className="assignment-details mb-4">
          {(isBulkRevoke && data.selectedCodes.length > 0) && <p className="bulk-selected-codes">{displaySelectedCodes(data.selectedCodes.length)}</p>}
          {!isBulkRevoke && this.hasIndividualRevokeData() && (
            <>
              <p className="code">{displayCode(data.code)}</p>
              <p className="email">{displayEmail(data.assigned_to)}</p>
            </>
          )}
        </div>
        <EmailTemplateForm emailTemplateType={MODAL_TYPES.revoke} disabled={doNotEmail}>
          <Field
            name="do-not-email"
            className="do-not-email-wrapper"
            component={CheckboxWithTooltip}
            label="Do not email"
            checked={doNotEmail}
            id="doNotEmailCheckbox"
            icon={Info}
            altText="More information"
            tooltipText="By clicking this box, you can revoke this coupon code without emailing the learner."
            onChange={(event, newValue) => {
              this.setDoNotEmail(newValue);
            }}
          />
        </EmailTemplateForm>
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
      doNotEmail,
    } = this.state;

    return (
      <Modal
        ref={this.modalRef}
        dialogClassName="code-revoke"
        title={this.renderTitle()}
        body={this.renderBody()}
        buttons={[
          <Button
            key="revoke-submit-btn"
            disabled={submitting}
            className="code-revoke-save-btn"
            onClick={handleSubmit(this.handleModalSubmit)}
          >
            {mode === MODAL_TYPES.revoke && submitting && <Spinner animation="border" className="mr-2" variant="primary" size="sm" />}
            Revoke
          </Button>,
          <SaveTemplateButton
            key="save-revoke-template-btn"
            templateType={MODAL_TYPES.revoke}
            setMode={this.setMode}
            handleSubmit={handleSubmit}
            disabled={doNotEmail}
          />,
        ]}
        onClose={onClose}
        open
      />
    );
  }
}

CodeRevokeModal.defaultProps = {
  error: null,
  isBulkRevoke: false,
  data: {},
};

CodeRevokeModal.propTypes = {
  // props from redux
  enterpriseSlug: PropTypes.string.isRequired,
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
