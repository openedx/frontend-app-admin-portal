import PropTypes from 'prop-types';
import { REQUEST_RECENT_ACTIONS } from './data';

const RequestRecentActionTableCell = ({ row }) => {
  const { original } = row;
  const {
    latestAction,
    lastActionDate,
  } = original;

  const formatRecentActionDisplay = () => {
    // Check if latestAction exists and has recentAction property
    if (!latestAction || !latestAction.recentAction) {
      return {
        actionType: 'No action',
        timestamp: lastActionDate || 'N/A',
      };
    }

    const actionType = latestAction.recentAction;
    return {
      actionType: `${REQUEST_RECENT_ACTIONS[actionType].charAt(0).toUpperCase()}${REQUEST_RECENT_ACTIONS[actionType].slice(1)}`,
      timestamp: lastActionDate,
    };
  };

  const { actionType, timestamp } = formatRecentActionDisplay();

  return (
    <span>
      {actionType}: {timestamp}
    </span>
  );
};

RequestRecentActionTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      latestAction: PropTypes.shape({
        recentAction: PropTypes.string,
      }),
      lastActionDate: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default RequestRecentActionTableCell;
