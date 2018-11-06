import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Icon, Dropdown } from '@edx/paragon';

import Img from '../Img';
import LinkWrapper from '../LinkWrapper';
import EdxLogo from '../../images/edx-logo.png';
import './Header.scss';


class Header extends React.Component {
  getProfileIconElement() {
    const { userProfile, email } = this.props;
    const profileImage = userProfile && userProfile.image_url_medium;
    const screenReaderText = `Profile image for ${email}`;

    if (profileImage) {
      return <Img src={profileImage} alt={screenReaderText} />;
    }
    return <Icon className={['fa', 'fa-user', 'px-3']} screenReaderText={screenReaderText} />;
  }

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
            iconElement={this.getProfileIconElement()}
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
  userProfile: PropTypes.shape({}), // eslint-disable-line react/forbid-prop-types
};

Header.defaultProps = {
  enterpriseLogo: null,
  enterpriseName: null,
  email: null,
  userProfile: null,
};

export default Header;
