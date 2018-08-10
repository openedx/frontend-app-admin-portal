import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Dropdown } from '@edx/paragon';

import Img from '../Img';
import LinkWrapper from '../LinkWrapper';
import EdxLogo from '../../images/edx-logo.png';
import './Header.scss';

const Header = (props) => {
  const {
    enterpriseLogo,
    email,
  } = props;

  return (
    <header className="container">
      <nav className="navbar px-0 justify-content-between">
        <div>
          <Link
            to="/"
            className="navbar-brand"
          >
            <Img src={enterpriseLogo || EdxLogo} alt="" />
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
};

Header.propTypes = {
  enterpriseLogo: PropTypes.string,
  email: PropTypes.string,
};

Header.defaultProps = {
  enterpriseLogo: null,
  email: null,
};

export default Header;
