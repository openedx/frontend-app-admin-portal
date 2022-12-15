import { Toast } from '@edx/paragon';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ContentHighlightToast = ({ toastText }) => {
  const [toastState, setToastState] = useState(false);
  const handleClose = () => {
    setToastState(false);
  };
  useEffect(() => {
    setToastState(true);
  }, []);
  return (
    <Toast
      onClose={() => handleClose()}
      show={toastState}
    >
      {toastText}
    </Toast>

  );
};

ContentHighlightToast.propTypes = {
  toastText: PropTypes.string,
};

ContentHighlightToast.defaultProps = {
  toastText: '',
};

export default ContentHighlightToast;
