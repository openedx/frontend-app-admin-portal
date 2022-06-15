import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Icon } from '@edx/paragon';

const StatusAlert = (props) => {
  const {
    alertType,
    className,
    iconClassName,
    title,
    message,
    dismissible,
    onClose,
  } = props;

  const showIcon = () => {
    if (iconClassName) {
      return (
        <div className="icon">
          <Icon className={iconClassName} />
        </div>
      );
    }
    return null;
  };

  return (
    <Alert
      className={className}
      variant={alertType}
      dismissible={dismissible}
      onClose={onClose}
      open
      {...iconClassName && { icon: showIcon }}
    >
      <div className="alert-dialog">
        <div className="message">
          {title && (
            <span className="title">{title}</span>
          )}
          {message}
        </div>
      </div>
    </Alert>
  );
};

StatusAlert.propTypes = {
  alertType: PropTypes.string.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  title: PropTypes.string,
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
};

StatusAlert.defaultProps = {
  className: '',
  iconClassName: undefined,
  title: null,
  dismissible: false,
  onClose: () => {},
};

export default StatusAlert;
