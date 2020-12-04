import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IconLink = props => {
  const {
    to, isExpanded, title, icon,
  } = props;
  return (
    <NavLink
      className="nav-link text-left rounded-0"
      to={to}
    >
      <FontAwesomeIcon icon={icon} className={classNames([{ 'mr-2': isExpanded }])} />
      {!isExpanded ? <span className="sr-only">{title}</span> : null}
      {isExpanded && title}
    </NavLink>
  );
};

IconLink.defaultProps = {
  icon: null,
  isExpanded: false,
};

IconLink.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.shape({}),
  isExpanded: PropTypes.bool,
};

export default IconLink;
