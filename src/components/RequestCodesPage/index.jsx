import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { SubmissionError } from 'redux-form';
import { logError } from '@edx/frontend-platform/logging';

import RequestCodesForm from './RequestCodesForm';
import Hero from '../Hero';
import LoadingMessage from '../LoadingMessage';

import LmsApiService from '../../data/services/LmsApiService';

class RequestCodesPage extends React.Component {
  hasEmailAndEnterpriseName() {
    const { emailAddress, enterpriseName } = this.props;
    return !!(emailAddress && enterpriseName);
  }

  render() {
    const {
      emailAddress,
      enterpriseName,
      match,
    } = this.props;

    return (
      <>
        <Helmet>
          <title>Request More Codes</title>
        </Helmet>
        <Hero title="Request More Codes" />
        <div className="container-fluid">
          <div className="row my-3">
            <div className="col">
              {this.hasEmailAndEnterpriseName() ? (
                <RequestCodesForm
                  onSubmit={options => (
                    LmsApiService.requestCodes(options)
                      .then(response => response)
                      .catch((error) => {
                        logError(error);
                        throw new SubmissionError({ _error: error });
                      })
                  )}
                  initialValues={{
                    emailAddress, enterpriseName, numberOfCodes: '', notes: '',
                  }}
                  match={match}
                />
              ) : <LoadingMessage className="request-codes" />}
            </div>
          </div>
        </div>
      </>
    );
  }
}

RequestCodesPage.defaultProps = {
  enterpriseName: null,
  emailAddress: null,
};

RequestCodesPage.propTypes = {
  enterpriseName: PropTypes.string,
  emailAddress: PropTypes.string,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default RequestCodesPage;
