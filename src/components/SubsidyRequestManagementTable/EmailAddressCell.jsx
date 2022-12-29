import React from 'react';
import PropTypes from 'prop-types';

const EmailAddressCell = ({ row }) => <span data-hj-suppress>{row.original.email}</span>;

EmailAddressCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      email: PropTypes.string,
    }),
  }).isRequired,
};

export default EmailAddressCell;
