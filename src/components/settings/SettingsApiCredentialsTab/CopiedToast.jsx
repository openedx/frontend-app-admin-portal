import React from 'react';
import PropTypes from 'prop-types';
import { Toast } from '@edx/paragon';

const CopiedToast = ({ content, ...rest }) => (
  <Toast {...rest}>
    {content}
  </Toast>
);
CopiedToast.propTypes = {
  content: PropTypes.string.isRequired,
};
export default CopiedToast;
