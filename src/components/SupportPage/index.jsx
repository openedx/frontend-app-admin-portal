import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { SubmissionError } from 'redux-form';
import { MailtoLink } from '@edx/paragon';

import SupportForm from './SupportForm';
import Hero from '../Hero';
import { features } from '../../config/index';

import ZendeskApiService from '../../data/services/ZendeskApiService';
import NewRelicService from '../../data/services/NewRelicService';

class SupportPage extends React.Component {
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
          <title>Contact Support</title>
        </Helmet>
        <Hero title="Contact Support" />
        <div className="container-fluid">
          <div className="row my-3">
            <div className="col">
              {features.SUPPORT && this.hasEmailAndEnterpriseName() ? (
                <SupportForm
                  onSubmit={options => (
                    ZendeskApiService.createZendeskTicket(options)
                      .then(response => response)
                      .catch((error) => {
                        NewRelicService.logAPIErrorResponse(error);
                        throw new SubmissionError({ _error: error });
                      })
                  )}
                  initialValues={{
                    emailAddress, enterpriseName, subject: '', notes: '',
                  }}
                  match={match}
                />
              )
                : (
                  <p>
                    For assistance, please contact the edX Customer Success team at
                    {' '}
                    <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>.
                  </p>
                )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

SupportPage.defaultProps = {
  enterpriseName: null,
  emailAddress: null,
};

SupportPage.propTypes = {
  enterpriseName: PropTypes.string,
  emailAddress: PropTypes.string,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default SupportPage;
