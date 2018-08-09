import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import StatusAlert from '../../components/StatusAlert';
import H1 from '../../components/H1';
import NotFoundPage from '../NotFoundPage';

const ErrorPage = (props) => {
  const errorMessage = props.message || 'An unknown error has occured.';

  return (
    <div className="container">
      {props.status === 404 ? (
        <NotFoundPage />
      ) : (
        <div>
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
        </div>
      )}
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
