import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Redirect } from 'react-router-dom';
import { Button, InputText } from '@edx/paragon';

import Hero from '../Hero';

class RequestCodesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitted: false,
    };

    this.renderRedirect = this.renderRedirect.bind(this);
  }

  componentDidMount() {
    this.props.fetchPortalConfiguration(this.props.enterpriseSlug);
  }

  renderRedirect() {
    const { match: { url } } = this.props;

    // Remove `/request` from the url so it renders Code Management page again
    const path = url.split('/').slice(0, -1).join('/');

    return (
      <Redirect
        to={{
          pathname: path,
          state: { hasRequestedCodes: true },
        }}
      />
    );
  }

  render() {
    const { submitted } = this.state;
    const { emailAddress, enterpriseName } = this.props;

    return (
      <React.Fragment>
        <Helmet>
          <title>Request More Codes</title>
        </Helmet>
        <Hero title="Request More Codes" />
        <div className="container">
          <div className="row my-3">
            <div className="col-12 col-md-5">
              <form>
                <InputText
                  name="email"
                  label="Email Address"
                  type="email"
                  value={emailAddress || ''}
                />
                <InputText
                  name="company"
                  label="Company"
                  value={enterpriseName || ''}
                  disabled
                />
                <InputText
                  name="number-of-codes"
                  label="Number of Codes (optional)"
                  type="number"
                />
                <Button
                  label="Request Codes"
                  buttonType="primary"
                  onClick={() => this.setState({ submitted: true })}
                />
              </form>
              {submitted && this.renderRedirect()}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

RequestCodesPage.defaultProps = {
  enterpriseName: null,
  emailAddress: null,
};

RequestCodesPage.propTypes = {
  fetchPortalConfiguration: PropTypes.func.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseName: PropTypes.string,
  emailAddress: PropTypes.string,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default RequestCodesPage;
