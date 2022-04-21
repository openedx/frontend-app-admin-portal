import React, { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Bubble } from '@edx/paragon';

const BUBBLE_MARGIN_LEFT = 5;

const IconLink = (props) => {
  const {
    to, isExpanded, title, icon, external, id, notification,
  } = props;

  const iconRef = useRef();
  const titleRef = useRef();

  const [notificationBubbleLeft, setNotificationBubbleLeft] = useState(0);

  useLayoutEffect(() => {
    const iconRect = iconRef.current?.getBoundingClientRect();
    const titleRect = titleRef.current?.getBoundingClientRect();

    if (isExpanded && iconRect && titleRect) {
      setNotificationBubbleLeft(iconRect.width + titleRect.width + BUBBLE_MARGIN_LEFT);
      return;
    }

    if (iconRect) {
      setNotificationBubbleLeft(iconRect.width + BUBBLE_MARGIN_LEFT);
    }
  }, [iconRef, titleRef, isExpanded]);

  if (external) {
    return (
      <NavLink
        className="nav-link text-left rounded-0"
        to={{ pathname: to }}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span ref={iconRef}>
          <FontAwesomeIcon icon={icon} className={classNames({ 'mr-2': isExpanded })} />
        </span>
        {!isExpanded ? <span className="sr-only">{title}</span> : null}
        {isExpanded && <span ref={titleRef}>{title}</span>}
      </NavLink>
    );
  }

  return (
    <NavLink
      className="nav-link text-left rounded-0"
      to={to}
      id={id}
    >
      <div className="position-relative">
        <span ref={iconRef}>
          <FontAwesomeIcon icon={icon} className={classNames({ 'mr-2': isExpanded })} />
        </span>
        {!isExpanded && <span className="sr-only">{title}</span>}
        {isExpanded && <span ref={titleRef}>{title}</span>}
        {notification && (
          <Bubble
            variant="error"
            className="position-absolute"
            style={{
              minHeight: '0.5rem',
              minWidth: '0.5rem',
              left: notificationBubbleLeft,
              top: -2,
            }}
          >
            <span className="sr-only">has unread notifications</span>
          </Bubble>
        )}
      </div>
    </NavLink>
  );
};

IconLink.defaultProps = {
  icon: null,
  isExpanded: false,
  external: false,
  id: undefined,
  notification: false,
};

IconLink.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.shape({}),
  isExpanded: PropTypes.bool,
  external: PropTypes.bool,
  id: PropTypes.string,
  notification: PropTypes.bool,
};

export default IconLink;
