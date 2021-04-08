import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Icon } from '@edx/paragon';
import { Warning } from '@edx/paragon/icons';

const ModalError = React.forwardRef(({ title, errors }, ref) => (
  <div
    ref={ref}
    tabIndex="-1"
  >
    <Alert
      variant="danger"
    >
      <Icon src={Warning} screenReaderText="Warning" className="alert-icon" />
      {title && (
        <Alert.Heading>{title}</Alert.Heading>
      )}
      {errors.length > 1 ? (
        <ul className="m-0 pl-4">
          {errors.map(message => <li key={message}>{message}</li>)}
        </ul>
      ) : (
        errors[0]
      )}
    </Alert>
  </div>
));

ModalError.propTypes = {
  title: PropTypes.string.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ModalError;
