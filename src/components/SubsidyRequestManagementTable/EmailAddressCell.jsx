import React from 'react';
import PropTypes from 'prop-types';

const EmailAddressCell = ({ row }) => (
  <span data-hj-suppress>{row.original.emailAddress}</span>
);

EmailAddressCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      emailAddress: PropTypes.string,
    }),
  }).isRequired,
};

export default EmailAddressCell;
