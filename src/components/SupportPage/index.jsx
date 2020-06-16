import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import SupportForm from './SupportForm';
import Hero from '../Hero';
import LoadingMessage from '../LoadingMessage';

import './SupportPage.scss';

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
      <React.Fragment>
        <Helmet>
          <title>Contact Support</title>
        </Helmet>
        <Hero title="Contact Support" />
        <div className="container-fluid">
          <div className="row my-3">
            <div className="col">
              {this.hasEmailAndEnterpriseName() ? (
                <SupportForm
                  initialValues={{
                    emailAddress, enterpriseName, notes: '',
                  }}
                  match={match}
                />
              ) : <LoadingMessage className="support" />}
            </div>
          </div>
        </div>
      </React.Fragment>
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
