import React from 'react';
import PropTypes from 'prop-types';
import { StatusAlert as Alert, Icon } from '@edx/paragon';

const StatusAlert = (props) => {
  const {
    alertType,
    className,
    icon,
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
      dialog={(
        <div className="d-flex">
          {icon && (
            <div className="icon mr-2">
              <Icon src={icon} />
            </div>
          )}
          <div className="message">
            {title && (
              <span className="title">{title}</span>
            )}
            {message}
          </div>
        </div>
      )}
      onClose={onClose}
      open
    />
  );
};

StatusAlert.propTypes = {
  alertType: PropTypes.string.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  className: PropTypes.string,
  icon: PropTypes.func,
  title: PropTypes.string,
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
};

StatusAlert.defaultProps = {
  className: '',
  icon: undefined,
  title: null,
  dismissible: false,
  onClose: () => {},
};

export default StatusAlert;
