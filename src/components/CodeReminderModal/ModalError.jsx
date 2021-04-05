import React from 'react';
import PropTypes from 'prop-types';
import StatusAlert from '../StatusAlert';

const ModalError = React.forwardRef(({ title, errors }, ref) => (
  <div
    ref={ref}
    tabIndex="-1"
  >
    <StatusAlert
      alertType="danger"
      iconClassName="fa fa-times-circle"
      title={title}
      message={errors.length > 1 ? (
        <ul className="m-0 pl-4">
          {errors.map(message => <li key={message}>{message}</li>)}
        </ul>
      ) : (
        errors[0]
      )}
    />
  </div>
));

ModalError.propTypes = {
  title: PropTypes.string.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ModalError;
