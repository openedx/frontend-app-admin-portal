import React from 'react';
import PropTypes from 'prop-types';

const Header = ({
  title, subtitle, DownloadCSVComponent,
}) => (
  <div className="analytics-header d-flex justify-content-between row">
    <div className="col-8">
      <h2 className="analytics-header-title">{title}</h2>
      {subtitle && <p className="analytics-header-subtitle">{subtitle}</p>}
    </div>
    <div className="col-3 mr-0">
      {DownloadCSVComponent}
    </div>
  </div>
);

Header.defaultProps = {
  subtitle: undefined,
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  DownloadCSVComponent: PropTypes.element.isRequired,
};

export default Header;
