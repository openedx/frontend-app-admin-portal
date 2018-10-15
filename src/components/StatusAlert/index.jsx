import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { StatusAlert as Alert, Icon } from '@edx/paragon';

import './StatusAlert.scss';

const StatusAlert = (props) => {
  const {
    alertType,
    className,
    iconClassNames,
    title,
    message,
    dismissible,
    onClose,
  } = props;

  return (
    <Alert
      className={className}
      alertType={alertType}
      dismissible={dismissible}
      dialog={
        <div className={
          classNames({
            'd-flex': iconClassNames.length > 0,
          })}
        >
          {iconClassNames.length > 0 &&
            <div className="icon mr-2">
              <Icon className={iconClassNames} />
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
      onClose={onClose}
      open
    />
  );
};

StatusAlert.propTypes = {
  alertType: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  className: PropTypes.arrayOf(PropTypes.string),
  iconClassNames: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
};

StatusAlert.defaultProps = {
  className: [],
  iconClassNames: [],
  title: null,
  dismissible: false,
  onClose: () => {},
};

export default StatusAlert;
