import React from 'react';
import PropTypes from 'prop-types';

const RequestRecentActionTableCell = ({ row }) => {
  const { original } = row;
  const { requestDate, requestStatus } = original;

  // For approved requests, the recent action is typically the approval
  const actionType = requestStatus === 'approved' ? 'approved' : requestStatus;
  const formattedActionType = `${actionType.charAt(0).toUpperCase()}${actionType.slice(1)}`;

  // requestDate is already a formatted string from the transformation
  const formattedActionTimestamp = requestDate;

  return (
    <span>
      {formattedActionType}: {formattedActionTimestamp}
    </span>
  );
};

RequestRecentActionTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      requestDate: PropTypes.string.isRequired,
      requestStatus: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default RequestRecentActionTableCell;
