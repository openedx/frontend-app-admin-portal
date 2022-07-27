import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

function LoadingMessage(props) {
  const { className } = props;
  return (
    <div
      className={classNames(
        'loading d-flex align-items-center justify-content-center',
        className,
      )}
    >
      Loading...
      <span className="sr-only">Loading</span>
    </div>
  );
}

LoadingMessage.propTypes = {
  className: PropTypes.string.isRequired,
};

export default LoadingMessage;
