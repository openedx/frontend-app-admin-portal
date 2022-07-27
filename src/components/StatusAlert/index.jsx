import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { StatusAlert as Alert, Icon } from '@edx/paragon';

function StatusAlert(props) {
  const {
    alertType,
    className,
    iconClassName,
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
        <div className={
          classNames({
            'd-flex': iconClassName,
          })
}
        >
          {iconClassName && (
            <div className="icon mr-2">
              <Icon className={iconClassName} />
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
}

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
