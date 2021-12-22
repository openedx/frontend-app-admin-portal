import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@edx/paragon';

const StatusTableCell = ({ row }) => {
  const { isActive } = row.original;
  return (
    <Badge variant={isActive ? 'success' : 'light'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
};

StatusTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      isActive: PropTypes.bool,
    }),
  }).isRequired,
};

export default StatusTableCell;
