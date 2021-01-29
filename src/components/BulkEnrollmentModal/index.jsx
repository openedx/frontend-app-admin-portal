import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import {
  Alert, Button, Icon, Modal,
} from '@edx/paragon';
import TextAreaAutoSize from '../TextAreaAutoSize';
import CsvUpload from '../CsvUpload';

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
      // When there is an new error, focus on the error message status alert
      errorMessageRef.focus();
    }
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
        throw new SubmissionError({
          _error: [error.message],
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
        <Alert
          variant="danger"
          dismissible
        >
          <Alert.Heading>Unable to assign codes.</Alert.Heading>
          <p className="alert-body">{error}</p>
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
        <Alert
          variant="danger"
          dismissible
        >
          <Alert.Heading>
            Before you can invite learners to a course they must have a subscription license.
          </Alert.Heading>
          <p className="alert-body">
            The following emails addresses are not yet associated with a subscription.
            Please take note of the following learners and invite them from the subscription management page.
          </p>
          {failedLearners.map((failedLearner) => <p className="alert-email" key={`${failedLearner}-email`}>{failedLearner}</p>)}
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
              <p>The file must be a CSV containing a single file of email addresses.</p>
            </div>
          </div>
        </form>
      </>
    );
  }

  render() {
    const {
      onClose,
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
        onClose={onClose}
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
