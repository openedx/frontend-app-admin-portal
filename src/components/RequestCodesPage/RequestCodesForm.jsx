import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Link, Redirect } from 'react-router-dom';
import { Button, Icon } from '@edx/paragon';

import RenderField from '../RenderField';
import StatusAlert from '../StatusAlert';

import { isRequired, isValidEmail, isValidNumber } from '../../utils';

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
      <StatusAlert
        className={['mt-3']}
        alertType="danger"
        iconClassNames={['fa', 'fa-times-circle']}
        title="Unable to request more codes"
        message={`Try refreshing your screen (${message})`}
      />
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
      <React.Fragment>
        {submitFailed && error && this.renderErrorMessage()}
        <div className="request-codes-form row">
          <div className="col-12 col-md-6 col-lg-4">
            <form onSubmit={handleSubmit}>
              <Field
                name="emailAddress"
                type="email"
                component={RenderField}
                label={
                  <React.Fragment>
                    Email Address
                    <span className="required">*</span>
                  </React.Fragment>
                }
                validate={[isRequired, isValidEmail]}
                required
              />
              <Field
                name="enterpriseName"
                type="text"
                component={RenderField}
                label={
                  <React.Fragment>
                    Company
                    <span className="required">*</span>
                  </React.Fragment>
                }
                validate={[isRequired]}
                required
                disabled
              />
              <Field
                name="numberOfCodes"
                type="number"
                component={RenderField}
                label="Number of Codes"
                validate={[isValidNumber]}
              />
              <Button
                label={
                  <React.Fragment>
                    {submitting && <Icon className={['fa', 'fa-spinner', 'fa-spin', 'mr-2']} />}
                    Request Codes
                  </React.Fragment>
                }
                type="submit"
                disabled={invalid || submitting}
                buttonType="primary"
              />
              <Link
                className={['btn btn-link ml-3 form-cancel-btn']}
                to={this.getPathToCodeManagement()}
              >
                Cancel
              </Link>
            </form>
          </div>
        </div>
        {submitSucceeded && this.renderRedirect()}
      </React.Fragment>
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
