import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IconLink = props => (
  <NavLink
    className="nav-link text-left rounded-0"
    to={props.to}
  >
    <FontAwesomeIcon icon={props.icon} className={classNames([{ 'mr-2': props.isExpanded }])} />
    {!props.isExpanded ? <span className="sr-only">{props.title}</span> : null}
    {props.isExpanded && props.title}
  </NavLink>
);

IconLink.defaultProps = {
  icon: '',
  isExpanded: false,
};

IconLink.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.string,
  isExpanded: PropTypes.bool,
};

export default IconLink;
