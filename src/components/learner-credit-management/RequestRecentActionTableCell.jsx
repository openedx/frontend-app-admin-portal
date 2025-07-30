import React from 'react';
import PropTypes from 'prop-types';
import { REQUEST_RECENT_ACTIONS } from './data';

const RequestRecentActionTableCell = ({ row }) => {
  const { original } = row;
  const {
    requestDate,
    requestStatus,
    latestAction,
    lastActionDate,
  } = original;

  const formatRequest = () => {
    const hasRemindedAction = latestAction && latestAction.recentAction === REQUEST_RECENT_ACTIONS.reminded;
    // Using reminded action if the latest action is 'reminded' else fall back to requestStatus
    const status = hasRemindedAction ? latestAction.recentAction : requestStatus;
    const formattedActionType = `${status.charAt(0).toUpperCase()}${status.slice(1)}`;

    const formattedActionTimestamp = hasRemindedAction ? lastActionDate : requestDate;

    return { formattedActionType, formattedActionTimestamp };
  };

  const { formattedActionType, formattedActionTimestamp } = formatRequest();

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
      latestAction: PropTypes.shape({
        recentAction: PropTypes.string.isRequired,
      }).isRequired,
      lastActionDate: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default RequestRecentActionTableCell;
