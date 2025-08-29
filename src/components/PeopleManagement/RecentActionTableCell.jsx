import React from 'react';
import PropTypes from 'prop-types';
import formatDates from './utils';

const RecentActionTableCell = ({
  row,
}) => (
  <div>Added: {formatDates(row.original.activatedAt)}</div>
);

RecentActionTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      activatedAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default RecentActionTableCell;
