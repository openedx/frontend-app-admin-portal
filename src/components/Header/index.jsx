import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Dropdown } from '@edx/paragon';

import Img from '../Img';
import EdxLogo from '../../images/edx-logo.png';
import './Header.scss';

const Header = (props) => {
  const {
    enterpriseLogo,
    enterpriseSlug,
    email,
    logout,
  } = props;

  return (
    <header className="container">
      <nav className="navbar px-0 justify-content-between">
        <Link
          to={enterpriseSlug ? `/${enterpriseSlug}` : '/'}
          className="navbar-brand"
        >
          <Img src={enterpriseLogo || EdxLogo} alt="" />
        </Link>
        {email && <Dropdown
          title={email}
          menuItems={[
            <Link to="/login" onClick={logout}>Logout</Link>,
          ]}
        />}
      </nav>
    </header>
  );
};

Header.propTypes = {
  enterpriseSlug: PropTypes.string,
  enterpriseLogo: PropTypes.string,
  email: PropTypes.string,
  logout: PropTypes.func.isRequired,
};

Header.defaultProps = {
  enterpriseSlug: null,
  enterpriseLogo: null,
  email: null,
};

export default Header;
