import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dropdown } from '@edx/paragon';

import Img from '../../components/Img';

import EdxLogo from '../../images/edx-logo.png';
import './Header.scss';

const Header = (props) => {
  const { enterpriseLogo, enterpriseSlug } = props;

  return (
    <header className="container">
      <nav className="navbar px-0 justify-content-between">
        <Link
          to={enterpriseSlug ? `/${enterpriseSlug}` : '/'}
          className="navbar-brand"
        >
          <Img src={enterpriseLogo || EdxLogo} alt="" />
        </Link>
        <Dropdown
          title="edx@example.com"
          menuItems={[
            {
              label: 'Logout',
              href: '/',
            },
          ]}
        />
      </nav>
    </header>
  );
};

Header.propTypes = {
  enterpriseSlug: PropTypes.string,
  enterpriseLogo: PropTypes.string,
};

Header.defaultProps = {
  enterpriseSlug: null,
  enterpriseLogo: null,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseLogo: state.portalConfiguration.enterpriseLogo,
});

export default connect(mapStateToProps)(Header);
