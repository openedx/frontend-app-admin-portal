import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@openedx/paragon';

const StatusTableCell = ({ row }) => {
  const { isValid } = row.original;
  return (
    <Badge variant={isValid ? 'success' : 'light'}>
      {isValid ? 'Active' : 'Inactive'}
    </Badge>
  );
};

StatusTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      isValid: PropTypes.bool,
    }),
  }).isRequired,
};

export default StatusTableCell;
