import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import './LoadingMessage.scss';

const LoadingMessage = (props) => {
  const { className } = props;
  return (
    <div className={classNames(className, 'loading d-flex align-items-center justify-content-center')}>
      <span>Loading...</span>
    </div>
  );
};

LoadingMessage.propTypes = {
  className: PropTypes.string.isRequired,
};

export default LoadingMessage;
