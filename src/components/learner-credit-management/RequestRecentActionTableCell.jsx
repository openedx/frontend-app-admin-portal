import React from 'react';
import PropTypes from 'prop-types';

const RequestRecentActionTableCell = ({ row }) => {
  const { original } = row;
  const { requestDate, requestStatus } = original;

  // For approved requests, the recent action is typically the approval
  const formattedActionType = `${requestStatus.charAt(0).toUpperCase()}${requestStatus.slice(1)}`;

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
