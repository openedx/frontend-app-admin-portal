import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { configuration } from '../../config';

import Img from '../Img';
import './Footer.scss';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enterpriseLogoNotFound: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { enterpriseLogo } = this.props;
    if (enterpriseLogo && enterpriseLogo !== prevProps.enterpriseLogo) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        enterpriseLogoNotFound: false,
      });
    }
  }

  renderEnterpriseLogo() {
    const { enterpriseLogo, enterpriseSlug, enterpriseName } = this.props;
    return (
      <Link className="logo pl-4" to={`/${enterpriseSlug}`}>
        <Img
          src={enterpriseLogo}
          alt={`${enterpriseName} logo`}
          onError={() => this.setState({ enterpriseLogoNotFound: true })}
        />
      </Link>
    );
  }

  render() {
    const { enterpriseLogoNotFound } = this.state;
    const { enterpriseLogo, enterpriseSlug } = this.props;
    return (
      <footer className="container-fluid py-4 border-top">
        <div className="row justify-content-between align-items-center">
          <div className="col-xs-12 col-md-4 logo-links">
            <Link className="logo border-right pr-4" to="/">
              <Img src={configuration.LOGO_URL} alt="edX logo" />
            </Link>
            {enterpriseLogo && !enterpriseLogoNotFound && this.renderEnterpriseLogo()}
          </div>
          <div className="col-xs-12 col-md footer-links">
            <nav>
              <ul className="nav justify-content-end">
                <li className="nav-item border-right">
                  <a className="nav-link px-2" href="https://www.edx.org/edx-terms-service">
                    Terms of Service
                  </a>
                </li>
                <li className="nav-item border-right">
                  <a className="nav-link px-2" href="https://www.edx.org/edx-privacy-policy">
                    Privacy Policy
                  </a>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-2" to={enterpriseSlug ? `/${enterpriseSlug}/admin/support` : '/public/support'}>
                    Support
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    );
  }
}

Footer.propTypes = {
  enterpriseName: PropTypes.string,
  enterpriseSlug: PropTypes.string,
  enterpriseLogo: PropTypes.string,
};

Footer.defaultProps = {
  enterpriseName: null,
  enterpriseSlug: null,
  enterpriseLogo: null,
};

export default Footer;
