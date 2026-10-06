import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Link, Navigate } from 'react-router-dom';
import { Alert, Button, Spinner } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import RenderField from '../RenderField';

import {
  isRequired, isValidEmail, isNotValidNumberString, maxLength512,
} from '../../utils';
import messages from './messages';

const RequestCodesForm = ({
  url,
  error = null,
  handleSubmit,
  submitting,
  invalid,
  submitSucceeded,
  submitFailed,
}) => {
  const intl = useIntl();
  // Remove `/request` from the url so it renders Code Management page again
  const getPathToCodeManagement = () => url.split('/').slice(0, -1).join('/');

  const renderErrorMessage = () => {
    const { message } = error;

    return (
      <Alert
        className="mt-3"
        variant="danger"
        icon={Error}
      >
        <Alert.Heading>{intl.formatMessage(messages.errorHeading)}</Alert.Heading>
        <p>{intl.formatMessage(messages.errorRetry)} {message}</p>
      </Alert>
    );
  };

  const renderRedirect = () => (
    <Navigate
      to={getPathToCodeManagement()}
      state={{ hasRequestedCodes: true }}
      replace
    />
  );

  return (
    <>
      {submitFailed && error && renderErrorMessage()}
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
                  {intl.formatMessage(messages.emailLabel)}
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
                  {intl.formatMessage(messages.companyLabel)}
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
              label={intl.formatMessage(messages.numberOfCodesLabel)}
              validate={[isNotValidNumberString]}
              data-hj-suppress
            />
            <Field
              name="notes"
              className="notes"
              type="text"
              component={RenderField}
              label={intl.formatMessage(messages.notesLabel)}
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
                {intl.formatMessage(messages.submitButton)}
              </>
            </Button>
            <Link
              className="btn btn-link ml-3 form-cancel-btn"
              to={getPathToCodeManagement()}
            >
              {intl.formatMessage(messages.cancelButton)}
            </Link>
          </form>
        </div>
      </div>
      {submitSucceeded && renderRedirect()}
    </>
  );
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
  url: PropTypes.string.isRequired,
  initialValues: PropTypes.shape({ // eslint-disable-line react/no-unused-prop-types
    emailAddress: PropTypes.string.isRequired,
    enterpriseName: PropTypes.string.isRequired,
    numberOfCodes: PropTypes.string.isRequired,
  }).isRequired,
};

export default reduxForm({ form: 'request-codes-form' })(RequestCodesForm);
