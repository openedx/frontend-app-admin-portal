import { Toast } from '@edx/paragon';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ContentHighlightToast = ({ toastText }) => {
  /* Toast visibility state initially set to false to ensure the toast's
  fade-in animation occurs on mount once `showToast` set to true. */
  const [showToast, setIsToastShown] = useState(false);
  const handleClose = () => {
    setIsToastShown(false);
  };
  useEffect(() => {
    setIsToastShown(true);
  }, []);
  return (
    <Toast
      onClose={handleClose}
      show={showToast}
    >
      {toastText}
    </Toast>

  );
};

ContentHighlightToast.propTypes = {
  toastText: PropTypes.string.isRequired,
};

export default ContentHighlightToast;
