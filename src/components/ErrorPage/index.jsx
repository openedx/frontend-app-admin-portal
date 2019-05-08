import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import StatusAlert from '../StatusAlert';
import H1 from '../H1';
import NotFoundPage from '../NotFoundPage';
import ForbiddenPage from '../ForbiddenPage';


function renderErrorComponent(status, message) {
  const errorMessage = message || 'An unknown error has occured.';
  if (status === 404) {
    return <NotFoundPage />;
  } else if (status === 403) {
    return <ForbiddenPage />;
  }
  return (
    <React.Fragment>
      <Helmet>
        <title>Error</title>
      </Helmet>
      <div className="row mt-4">
        <div className="col">
          <H1>Error</H1>
          <StatusAlert
            alertType="danger"
            message={errorMessage}
          />
        </div>
      </div>
    </React.Fragment>
  );
}

const ErrorPage = (props) => {
  const { status, message } = props;
  return (
    <div className="container-fluid">
      {renderErrorComponent(status, message)}
    </div>
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
