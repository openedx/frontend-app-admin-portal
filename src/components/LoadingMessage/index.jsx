import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const LoadingMessage = (props) => {
  const { className } = props;
  return (
    <div
      className={classNames(
        'loading d-flex align-items-center justify-content-center',
        className,
      )}
    >
      Loading...
    </div>
  );
};

LoadingMessage.propTypes = {
  className: PropTypes.string.isRequired,
};

export default LoadingMessage;
