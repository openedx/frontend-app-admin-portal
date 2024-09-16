import React from 'react';
import PropTypes from 'prop-types';

const EmailCell = ({ row }) => (
  <span data-hj-suppress>{row.original.userEmail}</span>
);

EmailCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      userEmail: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default EmailCell;
