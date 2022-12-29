import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown, Navbar, AvatarButton, Nav,
} from '@edx/paragon';
import { getProxyLoginUrl } from '@edx/frontend-enterprise-logistration';

import {
  getAuthenticatedUser, getLogoutRedirectUrl,
} from '@edx/frontend-platform/auth';
import SidebarToggle from '../../containers/SidebarToggle';
import Img from '../Img';

import { configuration } from '../../config';

import './Header.scss';

export const Logo = ({ enterpriseLogo, enterpriseName }) => {
  const logo = configuration.LOGO_URL;

  return (
    <Img
      src={enterpriseLogo || logo}
      alt={`${enterpriseName} logo`}
      onError={(e) => { e.target.src = logo; }}
    />
  );
};

Logo.defaultProps = {
  enterpriseLogo: configuration.LOGO_URL,
  enterpriseName: 'edX',
};

Logo.propTypes = {
  enterpriseLogo: PropTypes.string,
  enterpriseName: PropTypes.string,
};

export const HeaderDropdown = ({ user, enterpriseSlug }) => {
  const { profileImage, username } = user;
  const avatarImage = profileImage?.hasImage ? profileImage.imageUrlMedium : null;
  const avatarScreenReaderText = `Profile image for ${username}`;

  return (
    <Dropdown>
      <Dropdown.Toggle
        as={AvatarButton}
        src={avatarImage}
        id="avatar-dropdown"
        size="md"
        alt={avatarScreenReaderText}
      >
        {username}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item
          href={getLogoutRedirectUrl(getProxyLoginUrl(enterpriseSlug))}
        >
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

HeaderDropdown.defaultProps = {
  enterpriseSlug: null,
};

HeaderDropdown.propTypes = {
  user: PropTypes.shape({
    profileImage: PropTypes.shape({
      hasImage: PropTypes.bool.isRequired,
      imageUrlMedium: PropTypes.string,
    }),
    username: PropTypes.string.isRequired,
  }).isRequired,
  enterpriseSlug: PropTypes.string,
};

const Header = ({
  hasSidebarToggle, enterpriseName, enterpriseLogo, enterpriseSlug,
}) => {
  const user = getAuthenticatedUser();
  return (
    <header className="container-fluid border-bottom">
      <Navbar aria-label="header" className="px-0 py-1 justify-content-between">
        <Nav aria-label="Main">
          {hasSidebarToggle && <SidebarToggle />}
          <Nav.Link
            href="/"
            className="navbar-brand"
          >
            <Logo enterpriseLogo={enterpriseLogo} enterpriseName={enterpriseName} />
          </Nav.Link>
        </Nav>
        {(user?.username && enterpriseSlug) && (
          <Nav aria-label="Secondary" className="align-items-center ml-auto">
            <HeaderDropdown user={user} enterpriseSlug={enterpriseSlug} />
          </Nav>
        )}
      </Navbar>
    </header>
  );
};

Header.propTypes = {
  enterpriseLogo: PropTypes.string,
  enterpriseName: PropTypes.string,
  enterpriseSlug: PropTypes.string,
  hasSidebarToggle: PropTypes.bool,
};

Header.defaultProps = {
  // undefined ensures that any components it is passed to use the default props
  enterpriseLogo: undefined,
  enterpriseName: undefined,
  enterpriseSlug: undefined,
  hasSidebarToggle: false,
};

export default Header;
