import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';
import { StatusAlert } from '@edx/paragon';

import H1 from '../../components/H1';

const ErrorPage = (props) => {
  const { location } = props;
  if (location.state && location.state.error) {
    const { error } = location.state;

    return (
      <div className="container">
        {error.status === 404 ? (
          <Redirect to="/404" />
        ) : (
          <div>
            <Helmet>
              <title>Error</title>
            </Helmet>
            <H1>Error</H1>
            {/* TODO: Replace with custom StatusAlert wrapper */}
            <StatusAlert
              alertType="danger"
              dismissible={false}
              dialog={location.state.error.message}
              open
            />
          </div>
        )}
      </div>
    );
  }
  return <Redirect to="/" />;
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
