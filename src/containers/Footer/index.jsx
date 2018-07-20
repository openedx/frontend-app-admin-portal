import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Img from '../../components/Img';

import EdxLogo from '../../images/edx-logo.png';
import './Footer.scss';

const Footer = (props) => {
  const { enterpriseLogo, enterpriseSlug } = props;

  const renderEdxLogo = () => {
    const EdXLogoImg = <Img src={EdxLogo} alt="edX logo" />;

    if (enterpriseLogo) {
      return (
        <a href="https://www.edx.org" className="logo">
          {EdXLogoImg}
        </a>
      );
    }

    return (
      <Link className="logo" to="/">
        {EdXLogoImg}
      </Link>
    );
  };

  return (
    <footer className="container pb-4">
      <div className="row justify-content-between align-items-center">
        <div className="col-xs-12 col-md-4 logo-links">
          {renderEdxLogo()}
          {enterpriseLogo && enterpriseSlug &&
            <Link className="logo" to={`/${enterpriseSlug}`}>
              <Img src={enterpriseLogo} alt="" />
            </Link>
          }
        </div>
        <div className="col-xs-12 col-md footer-links">
          <nav>
            <ul className="nav justify-content-end">
              <li className="nav-item">
                <a className="nav-link" href="https://www.edx.org/edx-terms-service">
                  Terms of Service
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://www.edx.org/edx-privacy-policy">
                  Privacy Policy
                </a>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={enterpriseSlug ? `/${enterpriseSlug}/support` : '/support'}>
                  Support
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  enterpriseSlug: PropTypes.string,
  enterpriseLogo: PropTypes.string,
};

Footer.defaultProps = {
  enterpriseSlug: null,
  enterpriseLogo: null,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseLogo: state.portalConfiguration.enterpriseLogo,
});

export default connect(mapStateToProps)(Footer);
