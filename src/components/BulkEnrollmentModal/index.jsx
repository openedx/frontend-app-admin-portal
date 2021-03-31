import React from 'react';
import PropTypes from 'prop-types';
import {
  Field, reduxForm, SubmissionError, reset,
} from 'redux-form';

import { logError } from '@edx/frontend-platform/logging';
import {
  Alert, Button, Icon, Modal,
} from '@edx/paragon';

import ReduxFormCheckbox from '../ReduxFormCheckbox';
import TextAreaAutoSize from '../TextAreaAutoSize';
import {
  EMAIL_ADDRESS_TEXT_FORM_DATA,
  EMAIL_ADDRESS_TEXT_LABEL,
  EMAIL_ADDRESS_CSV_FORM_DATA,
  EMAIL_ADDRESS_CSV_LABEL,
  NOTIFY_LEARNERS_FORM_DATA,
  NOTIFY_LEARNERS_LABEL,
} from '../../data/constants/addUsers';
import { returnValidatedEmails } from '../../data/validation/email';
import FileInput from '../FileInput';
import { normalizeFileUpload } from '../../utils';

const NOTIFY_LEARNER_DEFAULT_VALUE = true;

class BulkEnrollmentModal extends React.Component {
  constructor(props) {
    super(props);
    this.errorMessageRef = React.createRef();
    this.modalRef = React.createRef();

    this.handleModalSubmit = this.handleModalSubmit.bind(this);
    this.renderBody = this.renderBody.bind(this);
    this.renderErrorMessage = this.renderErrorMessage.bind(this);
    this.renderFailedLearnersMessage = this.renderFailedLearnersMessage.bind(this);
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
      // When there is a new error, focus on the error message status alert
      errorMessageRef.focus();
    }
  }

  handleModalClose = () => {
    const {
      onClose,
      dispatch,
    } = this.props;
    dispatch(reset('bulk-enrollment-modal-form'));
    onClose();
  }

  handleModalSubmit(formData) {
    const {
      enterpriseUuid,
      sendBulkEnrollment,
      selectedCourseRunKeys,
    } = this.props;

    const options = {
      course_run_keys: selectedCourseRunKeys,
      notify: formData.notify,
    };
    options.emails = returnValidatedEmails(formData);

    return sendBulkEnrollment(enterpriseUuid, options)
      .then(() => {
        this.props.setEnrolledLearners(options.emails.length);
        this.props.onSuccess();
      })
      .catch((error) => {
        const { customAttributes } = error;
        // fall back to the error.message instead of showing no information but prefer the
        // cleaner info from customAttributes (frontend-platform)
        const customErrMessage = customAttributes ? (customAttributes.httpErrorResponseData || error.message)
          : error.message;

        logError(error, { enterpriseUuid });
        throw new SubmissionError({
          _error: [customErrMessage],
        });
      });
  }

  renderErrorMessage() {
    const { error } = this.props;
    let errorRendered = error;
    // handle 'non_field_error' as a special case for better UX, if we can parse it
    try {
      const errorAsJson = JSON.parse(error);
      if (errorAsJson.non_field_errors) {
        errorRendered = (
          <>
            <p>The following errors were encountered:</p>
            <ul className="list-group">
              {errorAsJson.non_field_errors.map(err => <li key={err}>{err}</li>)}
            </ul>
          </>
        );
      }
    } catch (parseError) { errorRendered = error; }
    return (
      <div
        ref={this.errorMessageRef}
        tabIndex="-1"
      >
        <Alert variant="danger">
          <Alert.Heading>Unable to enroll learners</Alert.Heading>
          <p className="alert-body text-break">{errorRendered}</p>
        </Alert>
      </div>
    );
  }

  renderFailedLearnersMessage(failedLearners) {
    return (
      <div
        ref={this.errorMessageRef}
        tabIndex="-1"
      >
        <Alert variant="danger">
          <Alert.Heading>
            Before you can invite learners to a course they must have a subscription license.
          </Alert.Heading>
          <p className="alert-body text-justify">
            The following emails addresses are not yet associated with a subscription.
            Please take note of the following learners and invite them from the subscription management page.
          </p>
          <ul className="list-group">
            {failedLearners.map(failedLearner => (
              <li className="list-group-item mb-1 alert-email" key={`${failedLearner}-email`}>
                {failedLearner}
              </li>
            ))}
          </ul>
        </Alert>
      </div>
    );
  }

  renderBody() {
    const {
      error,
      failedLearners,
      selectedCourseRunKeys,
    } = this.props;

    return (
      <>
        {error && this.renderErrorMessage()}
        {failedLearners.length > 0 && this.renderFailedLearnersMessage(failedLearners)}
        <p className="courses-selected">Courses selected: {selectedCourseRunKeys.length}</p>
        <form onSubmit={e => e.preventDefault()}>
          <div className="mt-4">
            <h3>Add Learners</h3>
            <div>
              <Field
                id={EMAIL_ADDRESS_TEXT_FORM_DATA}
                name={EMAIL_ADDRESS_TEXT_FORM_DATA}
                component={TextAreaAutoSize}
                label={EMAIL_ADDRESS_TEXT_LABEL}
                type="text"
              />
              <p>To add more than one user, enter one email address per line.</p>
            </div>
            <p>OR</p>
            <div>
              <Field
                id={EMAIL_ADDRESS_CSV_FORM_DATA}
                name={EMAIL_ADDRESS_CSV_FORM_DATA}
                component={FileInput}
                label={EMAIL_ADDRESS_CSV_LABEL}
                accept=".csv"
                normalize={normalizeFileUpload}
              />
              <p>The file must be a CSV containing a single column of email addresses.</p>
            </div>
            <div>
              <Field
                id={NOTIFY_LEARNERS_FORM_DATA}
                name={NOTIFY_LEARNERS_FORM_DATA}
                component={ReduxFormCheckbox}
                label={NOTIFY_LEARNERS_LABEL}
                type="checkbox"
              />
            </div>
          </div>
        </form>
      </>
    );
  }

  render() {
    const {
      open,
      handleSubmit,
      submitting,
      title,
    } = this.props;

    return (
      <Modal
        open={open}
        title={title}
        body={this.renderBody()}
        closeText="Cancel"
        onClose={() => this.handleModalClose()}
        buttons={[
          <Button
            key="enroll-submit-btn"
            disabled={submitting}
            variant="primary"
            onClick={handleSubmit(this.handleModalSubmit)}
          >
            <>
              {submitting && <Icon className="fa fa-spinner fa-spin mr-2" />}
              {'Enroll Learners'}
            </>
          </Button>,
        ]}
      />
    );
  }
}

BulkEnrollmentModal.defaultProps = {
  error: null,
  failedLearners: [],
  selectedCourseRunKeys: [],
  title: 'Enroll Learners',
  open: false,
};

BulkEnrollmentModal.propTypes = {
  // redux-form props
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  error: PropTypes.arrayOf(PropTypes.string),
  dispatch: PropTypes.func.isRequired,

  // custom props
  enterpriseUuid: PropTypes.string.isRequired,
  failedLearners: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  open: PropTypes.bool,
  selectedCourseRunKeys: PropTypes.arrayOf(PropTypes.string),
  sendBulkEnrollment: PropTypes.func.isRequired,
  title: PropTypes.string,
  setEnrolledLearners: PropTypes.func.isRequired,
};

export default reduxForm({
  form: 'bulk-enrollment-modal-form',
  initialValues: { notify: NOTIFY_LEARNER_DEFAULT_VALUE },
})(BulkEnrollmentModal);
