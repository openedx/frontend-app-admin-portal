import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Icon, Dropdown } from '@edx/paragon';
import { configuration } from '../../config';

import SidebarToggle from '../../containers/SidebarToggle';
import Img from '../Img';

import apiClient from '../../data/apiClient';

import './Header.scss';

class Header extends React.Component {
  componentDidMount() {
    if (this.props.username) {
      this.props.fetchUserAccount(this.props.username);
    }
  }

  getProfileIconElement() {
    const { email, userProfileImageUrl } = this.props;
    const screenReaderText = `Profile image for ${email}`;

    if (userProfileImageUrl) {
      return <Img className="user-profile-img mr-2" src={userProfileImageUrl} alt={screenReaderText} />;
    }
    return <Icon className="fa fa-user mr-2" screenReaderText={screenReaderText} />;
  }

  renderLogo() {
    const { enterpriseLogo, enterpriseName } = this.props;
    const logo = configuration.LOGO_URL;
    return (
      <Img
        src={enterpriseLogo || logo}
        alt={`${enterpriseName || 'edX'} logo`}
        onError={(e) => { e.target.src = logo; }}
      />
    );
  }

  render() {
    const { email, hasSidebarToggle } = this.props;
    return (
      <header className="container-fluid">
        <nav aria-label="header" className="navbar px-0 py-1 justify-content-between">
          <div>
            {hasSidebarToggle && <SidebarToggle />}
            <Link
              to="/"
              className="navbar-brand"
            >
              {this.renderLogo()}
            </Link>
          </div>
          {email && (
            // TODO: @edx/paragon's Dropdown is now a passthru component from react-bootstrap
            // that doesn't address focus management, so using the now-deprecated
            // previous version of the Dropdown component until the a11y issue is fixed.
            <Dropdown.Deprecated>
              <Dropdown.Deprecated.Button>
                {this.getProfileIconElement()}
                {email}
              </Dropdown.Deprecated.Button>
              <Dropdown.Deprecated.Menu>
                <Button
                  variant="link"
                  className="dropdown-item"
                  onClick={() => apiClient.logout()}
                >
                  Logout
                </Button>
              </Dropdown.Deprecated.Menu>
            </Dropdown.Deprecated>
          )}
        </nav>
      </header>
    );
  }
}

Header.propTypes = {
  enterpriseLogo: PropTypes.string,
  enterpriseName: PropTypes.string,
  email: PropTypes.string,
  username: PropTypes.string,
  userProfileImageUrl: PropTypes.string,
  fetchUserAccount: PropTypes.func,
  hasSidebarToggle: PropTypes.bool,
};

Header.defaultProps = {
  enterpriseLogo: null,
  enterpriseName: null,
  email: null,
  username: null,
  userProfileImageUrl: null,
  fetchUserAccount: () => {},
  hasSidebarToggle: false,
};

export default Header;
