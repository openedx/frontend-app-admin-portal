import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import { Alert } from '@openedx/paragon';
import { Cancel as ErrorIcon } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import NotFoundPage from '../NotFoundPage';
import ForbiddenPage from '../ForbiddenPage';

const ErrorPage = (props) => {
  const { status, message } = props;

  if (status === 404) {
    return <NotFoundPage />;
  }

  if (status === 403) {
    return <ForbiddenPage />;
  }

  const errorMessage = message || 'An unknown error has occurred.';

  return (
    <main role="main" style={{ flex: 1 }}>
      <Helmet>
        <title>Error</title>
      </Helmet>
      <div className="container-fluid">
        <div className="row mt-4">
          <div className="col">
            <Alert
              variant="danger"
              icon={ErrorIcon}
            >
              <Alert.Heading><FormattedMessage id="adminPortal.error.title" defaultMessage="Error" /></Alert.Heading>
              {errorMessage}
            </Alert>
          </div>
        </div>
      </div>
    </main>
  );
};

ErrorPage.propTypes = {
  status: PropTypes.number,
  message: PropTypes.string,
};

ErrorPage.defaultProps = {
  status: null,
  message: '',
};

export default ErrorPage;
