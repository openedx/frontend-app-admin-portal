import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Link, Redirect } from 'react-router-dom';
import { Alert, Button, Spinner } from '@openedx/paragon';

import RenderField from '../RenderField';

import {
  isRequired, isValidEmail, isNotValidNumberString, maxLength512,
} from '../../utils';

class RequestCodesForm extends React.Component {
  constructor(props) {
    super(props);
    this.renderRedirect = this.renderRedirect.bind(this);
  }

  getPathToCodeManagement() {
    const { match: { url } } = this.props;

    // Remove `/request` from the url so it renders Code Management page again
    return url.split('/').slice(0, -1).join('/');
  }

  renderErrorMessage() {
    const { error: { message } } = this.props;

    return (
      <Alert
        className="mt-3"
        variant="danger"
        icon={Error}
      >
        <Alert.Heading>Unable to request more codes</Alert.Heading>
        <p>Try refreshing your screen {message}</p>
      </Alert>
    );
  }

  renderRedirect() {
    return (
      <Redirect
        to={{
          pathname: this.getPathToCodeManagement(),
          state: { hasRequestedCodes: true },
        }}
      />
    );
  }

  render() {
    const {
      handleSubmit,
      submitting,
      invalid,
      submitSucceeded,
      submitFailed,
      error,
    } = this.props;

    return (
      <>
        {submitFailed && error && this.renderErrorMessage()}
        <div className="request-codes-form row">
          <div className="col-12 col-md-6 col-lg-4">
            <form onSubmit={handleSubmit}>
              <Field
                name="emailAddress"
                className="emailAddress"
                type="email"
                component={RenderField}
                label={(
                  <>
                    Email Address
                    <span className="required">*</span>
                  </>
                )}
                validate={[isRequired, isValidEmail]}
                required
                data-hj-suppress
              />
              <Field
                name="enterpriseName"
                className="enterpriseName"
                type="text"
                component={RenderField}
                label={(
                  <>
                    Company
                    <span className="required">*</span>
                  </>
                )}
                validate={[isRequired]}
                required
                disabled
                data-hj-suppress
              />
              <Field
                name="numberOfCodes"
                className="numberOfCodes"
                type="number"
                component={RenderField}
                label="Number of Codes"
                validate={[isNotValidNumberString]}
                data-hj-suppress
              />
              <Field
                name="notes"
                className="notes"
                type="text"
                component={RenderField}
                label="Notes"
                validate={[maxLength512]}
                data-hj-suppress
              />
              <Button
                type="submit"
                disabled={invalid || submitting}
                className="btn-primary"
              >
                <>
                  {submitting && <Spinner animation="border" className="mr-2" variant="light" size="sm" />}
                  Request Codes
                </>
              </Button>
              <Link
                className="btn btn-link ml-3 form-cancel-btn"
                to={this.getPathToCodeManagement()}
              >
                Cancel
              </Link>
            </form>
          </div>
        </div>
        {submitSucceeded && this.renderRedirect()}
      </>
    );
  }
}

RequestCodesForm.defaultProps = {
  error: null,
};

RequestCodesForm.propTypes = {
  // props From redux-form
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  error: PropTypes.instanceOf(Error),

  // custom props
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
  initialValues: PropTypes.shape({ // eslint-disable-line react/no-unused-prop-types
    emailAddress: PropTypes.string.isRequired,
    enterpriseName: PropTypes.string.isRequired,
    numberOfCodes: PropTypes.string.isRequired,
  }).isRequired,
};

export default reduxForm({ form: 'request-codes-form' })(RequestCodesForm);
