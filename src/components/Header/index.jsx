import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Dropdown } from '@edx/paragon';

import Img from '../Img';
import LinkWrapper from '../LinkWrapper';
import EdxLogo from '../../images/edx-logo.png';
import './Header.scss';

class Header extends React.Component {
  renderLogo() {
    const { enterpriseLogo, enterpriseName } = this.props;
    return (
      <Img
        src={enterpriseLogo || EdxLogo}
        alt={`${enterpriseName || 'edX'} logo`}
        onError={(e) => { e.target.src = EdxLogo; }}
      />
    );
  }

  render() {
    const { email } = this.props;
    return (
      <header className="container">
        <nav className="navbar px-0 justify-content-between">
          <div>
            <Link
              to="/"
              className="navbar-brand"
            >
              {this.renderLogo()}
            </Link>
            <span className="badge badge-secondary beta">Beta</span>
          </div>
          {email && <Dropdown
            title={email}
            menuItems={[
              <LinkWrapper to="/logout">Logout</LinkWrapper>,
            ]}
          />}
        </nav>
      </header>
    );
  }
}

Header.propTypes = {
  enterpriseLogo: PropTypes.string,
  enterpriseName: PropTypes.string,
  email: PropTypes.string,
};

Header.defaultProps = {
  enterpriseLogo: null,
  enterpriseName: null,
  email: null,
};

export default Header;
