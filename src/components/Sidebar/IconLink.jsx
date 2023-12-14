import React, { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { Bubble } from '@openedx/paragon';

const BUBBLE_MARGIN_LEFT = 5;

const BaseNavLink = ({
  icon,
  isExpanded,
  title,
  notification,
  ...rest
}) => {
  const iconRef = useRef();
  const titleRef = useRef();

  const [notificationBubbleMarginLeft, setNotificationBubbleMarginLeft] = useState(0);

  useLayoutEffect(() => {
    const iconRect = iconRef.current?.getBoundingClientRect?.();
    const titleRect = titleRef.current?.getBoundingClientRect?.();

    if (isExpanded && iconRect && titleRect) {
      setNotificationBubbleMarginLeft(iconRect.width + titleRect.width + BUBBLE_MARGIN_LEFT);
      return;
    }

    if (iconRect) {
      setNotificationBubbleMarginLeft(iconRect.width + BUBBLE_MARGIN_LEFT);
    }
  }, [isExpanded]);

  const IconElement = React.cloneElement(icon, {
    className: classNames(
      icon.props.className,
      { 'mr-2': isExpanded },
    ),
  });

  return (
    <NavLink
      className="nav-link text-left rounded-0 d-flex align-items-center"
      {...rest}
    >
      <div className="position-relative d-flex align-items-center">
        <span ref={iconRef} className="d-flex align-items-center">
          {IconElement}
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
              left: notificationBubbleMarginLeft,
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

const commonPropTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  isExpanded: PropTypes.bool,
  notification: PropTypes.bool,
};
const commonDefaultProps = {
  isExpanded: false,
  notification: false,
};

BaseNavLink.propTypes = commonPropTypes;
BaseNavLink.defaultProps = commonDefaultProps;

const IconLink = (props) => {
  const { external, to, ...rest } = props;

  if (external) {
    return (
      <BaseNavLink
        to={{ pathname: to }}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      />
    );
  }
  return <BaseNavLink to={to} {...rest} />;
};

IconLink.defaultProps = {
  ...commonDefaultProps,
  external: false,
  id: undefined,
};

IconLink.propTypes = {
  ...commonPropTypes,
  to: PropTypes.string.isRequired,
  external: PropTypes.bool,
  id: PropTypes.string,
};

export default IconLink;
