import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from './data';

const AssignmentRecentActionTableCell = ({ row }) => {
  const { original: { recentAction } } = row;
  const { actionType, timestamp } = recentAction;
  const formattedActionType = `${actionType.charAt(0).toUpperCase()}${actionType.slice(1)}`;
  const formattedActionTimestamp = formatDate(timestamp);
  return (
    <span>{formattedActionType}: {formattedActionTimestamp}</span>
  );
};

AssignmentRecentActionTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      recentAction: PropTypes.shape({
        actionType: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default AssignmentRecentActionTableCell;
