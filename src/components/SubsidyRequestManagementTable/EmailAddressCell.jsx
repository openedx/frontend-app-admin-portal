import React from 'react';
import PropTypes from 'prop-types';

function EmailAddressCell({ row }) {
  return <span data-hj-suppress>{row.original.email}</span>;
}

EmailAddressCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      email: PropTypes.string,
    }),
  }).isRequired,
};

export default EmailAddressCell;
