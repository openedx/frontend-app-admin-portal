import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Redirect } from 'react-router-dom';
import { Button, InputText } from '@edx/paragon';
import StatusAlert from '../StatusAlert';

import Hero from '../Hero';

class RequestCodesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      numberOfCodes: null,
      emailAddress: props.emailAddress,
    };

    this.renderRedirect = this.renderRedirect.bind(this);
  }

  componentDidMount() {
    this.props.fetchPortalConfiguration(this.props.enterpriseSlug);
  }

  componentWillUnmount() {
    this.props.clearRequestCodes();
  }

  renderErrorMessage() {
    return (
      <StatusAlert
        className={['mt-3']}
        alertType="danger"
        iconClassName={['fa', 'fa-times-circle']}
        title="Unable to request more codes"
        message={`Try refreshing your screen (${this.props.error.message})`}
      />
    );
  }

  renderRedirect() {
    const { match: { url } } = this.props;

    // Remove `/request` from the url so it renders Code Management page again
    const path = url.split('/').slice(0, -1).join('/');

    return (
      <Redirect
        push
        to={{
          pathname: path,
          state: { hasRequestedCodes: true },
        }}
      />
    );
  }

  render() {
    const { numberOfCodes, emailAddress } = this.state;
    const {
      enterpriseName,
      error,
      success,
      requestCodes,
    } = this.props;

    const formInput = { enterpriseName, emailAddress, numberOfCodes };

    return (
      <React.Fragment>
        <Helmet>
          <title>Request More Codes</title>
        </Helmet>
        <Hero title="Request More Codes" />
        <div className="container">
          <div className="row">
            <div className="col">
              {error && this.renderErrorMessage()}
            </div>
          </div>
          <div className="row my-3">
            <div className="col-12 col-md-5">
              <form>
                <InputText
                  name="email"
                  label="Email Address"
                  type="email"
                  value={emailAddress || ''}
                  onChange={value => this.setState({ emailAddress: value })}
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
                  value={numberOfCodes || ''}
                  onChange={value => this.setState({ numberOfCodes: value })}
                  type="number"
                />
                <Button
                  label="Request Codes"
                  buttonType="primary"
                  onClick={() => {
                    requestCodes(formInput);
                    }
                  }
                />
              </form>
              {success && this.renderRedirect()}
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
  success: false,
  error: null,
};

RequestCodesPage.propTypes = {
  fetchPortalConfiguration: PropTypes.func.isRequired,
  requestCodes: PropTypes.func.isRequired,
  clearRequestCodes: PropTypes.func.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseName: PropTypes.string,
  emailAddress: PropTypes.string,
  success: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default RequestCodesPage;
