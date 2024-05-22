import { Toast } from '@openedx/paragon';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ContentHighlightToast = ({ toastText }) => {
  /* Toast visibility state initially set to false to ensure the toast's
  fade-in animation occurs on mount once `showToast` set to true. */
  const [showToast, setShowToast] = useState(false);
  const handleClose = () => {
    setShowToast(false);
  };
  useEffect(() => {
    setShowToast(true);
  }, []);
  return (
    <Toast
      onClose={() => handleClose()}
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
