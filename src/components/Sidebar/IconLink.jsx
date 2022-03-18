import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IconLink = props => {
  const {
    to, isExpanded, title, icon, external, id,
  } = props;
  if (external) {
    return (
      <NavLink
        className="nav-link text-left rounded-0"
        to={{ pathname: to }}
        target="_blank"
      >
        <FontAwesomeIcon icon={icon} className={classNames([{ 'mr-2': isExpanded }])} />
        {!isExpanded ? <span className="sr-only">{title}</span> : null}
        {isExpanded && title}
      </NavLink>
    );
  }
  return (
    <NavLink
      className="nav-link text-left rounded-0"
      to={to}
      id={id}
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
  external: false,
  id: undefined,
};

IconLink.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.shape({}),
  isExpanded: PropTypes.bool,
  external: PropTypes.bool,
  id: PropTypes.string,
};

export default IconLink;
