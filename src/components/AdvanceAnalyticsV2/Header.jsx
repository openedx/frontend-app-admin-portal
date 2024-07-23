import React from 'react';
import PropTypes from 'prop-types';

const Header = ({ title, subtitle }) => (
  <div className="analytics-header">
    <h2 className="analytics-header-title">{title}</h2>
    {subtitle && <p className="analytics-header-subtitle">{subtitle}</p>}
  </div>
);

Header.defaultProps = {
  subtitle: undefined,
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

export default Header;
