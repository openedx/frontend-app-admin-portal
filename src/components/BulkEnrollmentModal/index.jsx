import React from 'react';
import PropTypes from 'prop-types';
import {
  Field, reduxForm, SubmissionError, reset,
} from 'redux-form';

import { logError } from '@edx/frontend-platform/logging';
import {
  Alert, Button, Icon, Modal,

} from '@edx/paragon';

import TextAreaAutoSize from '../TextAreaAutoSize';
import CsvUpload from '../CsvUpload';
import { truncateString } from '../../utils';

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

    const bulkEnrollmentPromises = selectedCourseRunKeys.map((selectedCourseRunKey) => {
      const options = {
        course_run_key: selectedCourseRunKey,
        email: formData['bulk-enrollment-email-addresses'],
        email_csv: formData['bulk-enrollment-email-csv'],
      };
      return sendBulkEnrollment(enterpriseUuid, options);
    });

    return Promise.all(bulkEnrollmentPromises)
      .then(() => {
        this.props.onSuccess();
      })
      .catch((error) => {
        const { customAttributes } = error;
        // fall back to the error.message instead of showing no information but prefer the
        // cleaner info from customAttributes
        const customErrMessage = truncateString(
          customAttributes ? (customAttributes.httpErrorResponseData || error.message) : error.message,
          240,
        );
        logError(error, { enterpriseUuid });
        throw new SubmissionError({
          _error: [customErrMessage],
        });
      });
  }

  renderErrorMessage() {
    const { error } = this.props;
    return (
      <div
        ref={this.errorMessageRef}
        tabIndex="-1"
      >
        <Alert variant="danger">
          <Alert.Heading>Unable to enroll learners</Alert.Heading>
          <p className="alert-body text-break">{error}</p>
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
          {failedLearners.map((failedLearner) => (
            <p className="mb-1 alert-email" key={`${failedLearner}-email`}>{failedLearner}</p>
          ))}
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
                id="bulk-enrollment-email-addresses"
                name="bulk-enrollment-email-addresses"
                component={TextAreaAutoSize}
                label="Email addresses"
                type="text"
              />
              <p>To add more than one user, enter one email address per line.</p>
            </div>
            <p>OR</p>
            <div>
              <Field
                id="bulk-enrollment-email-csv"
                name="bulk-enrollment-email-csv"
                component={CsvUpload}
                label="Email addresses"
                type="file"
              />
              <p>{`The file must be a CSV containing a single column of email addresses.
                The first line must contain the word 'email'.`}
              </p>
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
};

export default reduxForm({
  form: 'bulk-enrollment-modal-form',
})(BulkEnrollmentModal);
