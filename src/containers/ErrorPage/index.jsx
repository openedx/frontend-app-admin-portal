import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';

import StatusAlert from '../../components/StatusAlert';
import H1 from '../../components/H1';

const ErrorPage = (props) => {
  const error = props.location && props.location.state && props.location.state.error;
  const errorMessage = (error && error.message) || 'An unknown error has occured.';

  return (
    <div className="container">
      {error && error.status === 404 ? (
        <Redirect to="/404" />
      ) : (
        <div>
          <Helmet>
            <title>Error</title>
          </Helmet>
          <H1>Error</H1>
          <StatusAlert
            alertType="danger"
            message={errorMessage}
          />
        </div>
      )}
    </div>
  );
};

ErrorPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      error: PropTypes.shape({
        status: PropTypes.number,
        message: PropTypes.string,
      }),
    }),
  }),
};

ErrorPage.defaultProps = {
  location: {},
};

export default ErrorPage;
