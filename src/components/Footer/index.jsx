import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import { configuration } from '../../config';

import Img from '../Img';
import messages from './messages';
import './Footer.scss';

const Footer = ({ enterpriseLogo = null, enterpriseSlug = null, enterpriseName = null }) => {
  const [enterpriseLogoNotFound, setEnterpriseLogoNotFound] = useState(false);

  const { formatMessage } = useIntl();

  useEffect(() => {
    if (enterpriseLogo) {
      setEnterpriseLogoNotFound(false);
    }
  }, [enterpriseLogo]);

  const renderEnterpriseLogo = () => (
    <Link className="logo pl-4" to={`/${enterpriseSlug}`}>
      <Img
        src={enterpriseLogo}
        alt={`${enterpriseName} logo`}
        onError={() => setEnterpriseLogoNotFound(true)}
      />
    </Link>
  );

  return (
    <footer className="container-fluid py-4 border-top">
      <div className="row justify-content-between align-items-center">
        <div className="col-xs-12 col-md-4 logo-links">
          <Link className="logo border-right pr-4" to="/">
            <Img src={configuration.LOGO_TRADEMARK_URL} alt="edX logo" />
          </Link>
          {enterpriseLogo && !enterpriseLogoNotFound && renderEnterpriseLogo()}
        </div>
        <div className="col-xs-12 col-md footer-links">
          <nav>
            <ul className="nav justify-content-end small">
              <li className="nav-item border-right">
                <a className="nav-link px-2" href="https://www.edx.org/edx-terms-service">
                  {formatMessage(messages.termsOfService)}
                </a>
              </li>
              <li className="nav-item border-right">
                <a className="nav-link px-2" href="https://www.edx.org/edx-privacy-policy">
                  {formatMessage(messages.privacyPolicy)}
                </a>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link px-2"
                  to={configuration.ENTERPRISE_SUPPORT_URL}
                  target="_blank"
                >
                  {formatMessage(messages.support)}
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
  enterpriseName: PropTypes.string,
  enterpriseSlug: PropTypes.string,
  enterpriseLogo: PropTypes.string,
};

export default Footer;
