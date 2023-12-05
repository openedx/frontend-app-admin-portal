import {
  Chip,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import FailedBadEmail from './assignments-status-chips/FailedBadEmail';
import FailedCancellation from './assignments-status-chips/FailedCancellation';
import FailedSystem from './assignments-status-chips/FailedSystem';
import NotifyingLearner from './assignments-status-chips/NotifyingLearner';
import WaitingForLearner from './assignments-status-chips/WaitingForLearner';

const AssignmentStatusTableCell = ({ row }) => {
  const { original } = row;
  const {
    learnerEmail,
    learnerState,
    errorReason,
  } = original;

  // Learner state is not available for this assignment, so don't display anything.
  if (!learnerState) {
    return null;
  }

  // Display the appropriate status chip based on the learner state.
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
    // Determine which failure chip to display based on the error reason.
    if (errorReason.actionType === 'notified') {
      if (errorReason.errorReason === 'email_error') {
        return (
          <FailedBadEmail learnerEmail={learnerEmail} />
        );
      }
      return <FailedSystem />;
    }

    if (errorReason.actionType === 'cancelled') {
      return <FailedCancellation />;
    }
  }

  // Note: The given `learnerState` not officially supported with a `ModalPopup`, but display it anyway.
  return <Chip>{`${learnerState.charAt(0).toUpperCase()}${learnerState.substr(1)}`}</Chip>;
};

AssignmentStatusTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      learnerEmail: PropTypes.string,
      learnerState: PropTypes.string.isRequired,
      errorReason: PropTypes.shape({
        actionType: PropTypes.string.isRequired,
        errorReason: PropTypes.string,
      }),
      actions: PropTypes.arrayOf(PropTypes.shape({
        actionType: PropTypes.string.isRequired,
        errorReason: PropTypes.string,
      })).isRequired,
    }).isRequired,
  }).isRequired,
};

export default AssignmentStatusTableCell;
