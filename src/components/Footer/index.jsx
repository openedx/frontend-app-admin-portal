import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { configuration } from '../../config';

import Img from '../Img';
import messages from './messages';
import './Footer.scss';
import useGlobalContext from '../GlobalProvider/useGlobalContext';
import { FOOTER_HEIGHT } from '../../data/constants/global';

class Footer extends React.Component {
  ref = createRef();

  constructor(props) {
    super(props);
    this.state = {
      enterpriseLogoNotFound: false,
    };
  }

  componentDidMount() {
    console.log(this.ref.current.offsetHeight);
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
    const { enterpriseLogo } = this.props;
    const { formatMessage } = this.props.intl;

    return (
      <footer ref={this.ref} className="container-fluid py-4 border-top">
        <div className="row justify-content-between align-items-center">
          <div className="col-xs-12 col-md-4 logo-links">
            <Link className="logo border-right pr-4" to="/">
              <Img src={configuration.LOGO_TRADEMARK_URL} alt="edX logo" />
            </Link>
            {enterpriseLogo && !enterpriseLogoNotFound && this.renderEnterpriseLogo()}
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
  }
}

Footer.propTypes = {
  enterpriseName: PropTypes.string,
  enterpriseSlug: PropTypes.string,
  enterpriseLogo: PropTypes.string,
  intl: intlShape.isRequired, // injected by injectIntl
};

Footer.defaultProps = {
  enterpriseName: null,
  enterpriseSlug: null,
  enterpriseLogo: null,
};

export default injectIntl(Footer);
