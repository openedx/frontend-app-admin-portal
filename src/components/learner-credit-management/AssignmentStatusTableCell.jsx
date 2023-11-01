import React from 'react';
import PropTypes from 'prop-types';
import {
  Chip,
} from '@edx/paragon';
import NotifyingLearner from './assignments-status-chips/NotifyingLearner';
import WaitingForLearner from './assignments-status-chips/WaitingForLearner';
import FailedBadEmail from './assignments-status-chips/FailedBadEmail';
import FailedSystem from './assignments-status-chips/FailedSystem';

const AssignmentStatusTableCell = ({ row }) => {
  const { original: { learnerEmail, learnerState } } = row;

  // Learner state is not available for this assignment, so don't display anything.
  if (!learnerState) {
    return null;
  }

  if (learnerState === 'notifying') {
    return (
      <NotifyingLearner learnerEmail={learnerEmail} />
    );
  }

  if (learnerState === 'waiting') {
    return (
      <WaitingForLearner learnerEmail={learnerEmail} />
    );
  }

  if (learnerState === 'failed') {
    // Determine the failure reason based on the actions.
    const { actions } = row.original;
    const mostRecentAction = actions[actions.length - 1]; // API returns actions in chronological order.

    const isBadEmailError = mostRecentAction.actionType === 'notified' && !!mostRecentAction.errorReason;

    if (isBadEmailError) {
      return (
        <FailedBadEmail learnerEmail={learnerEmail} />
      );
    }

    return <FailedSystem />;
  }

  // Note: The given `learnerState` not officially supported with a `ModalPopup`, but display it anyway.
  return <Chip>{`${learnerState.charAt(0).toUpperCase()}${learnerState.substr(1)}`}</Chip>;
};

AssignmentStatusTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      learnerEmail: PropTypes.string,
      learnerState: PropTypes.string.isRequired,
      actions: PropTypes.arrayOf(PropTypes.shape({
        actionType: PropTypes.string.isRequired,
        errorReason: PropTypes.string,
      })).isRequired,
    }).isRequired,
  }).isRequired,
};

export default AssignmentStatusTableCell;
