import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { StatusAlert as Alert, Icon } from '@edx/paragon';

import './StatusAlert.scss';

const StatusAlert = (props) => {
  const {
    alertType,
    className,
    iconClassName,
    title,
    message,
  } = props;

  return (
    <Alert
      className={className}
      alertType={alertType}
      dismissible={false}
      dialog={
        <div className={
          classNames({
            'd-flex': iconClassName && iconClassName.length > 0,
          })}
        >
          {iconClassName && iconClassName.length > 0 &&
            <div className="icon mr-2">
              <Icon className={iconClassName} />
            </div>
          }
          <div className="message">
            {title &&
              <span className="title">{title}</span>
            }
            {message}
          </div>
        </div>
      }
      open
    />
  );
};

StatusAlert.propTypes = {
  alertType: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  className: PropTypes.arrayOf(PropTypes.string),
  iconClassName: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
};

StatusAlert.defaultProps = {
  className: [],
  iconClassName: null,
  title: null,
};

export default StatusAlert;
