import {
  Chip,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import FailedBadEmail from './assignments-status-chips/FailedBadEmail';
import FailedCancellation from './assignments-status-chips/FailedCancellation';
import FailedReminder from './assignments-status-chips/FailedReminder';
import FailedSystem from './assignments-status-chips/FailedSystem';
import NotifyingLearner from './assignments-status-chips/NotifyingLearner';
import WaitingForLearner from './assignments-status-chips/WaitingForLearner';
import { capitalizeFirstLetter } from '../../utils';

const AssignmentStatusTableCell = ({ enterpriseId, row }) => {
  const { original } = row;
  const {
    learnerEmail,
    learnerState,
    errorReason,
  } = original;
  const sharedTrackEventMetadata = {
    learnerState,
  };

  const sendNotifyLearnerTrackEvent = () => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      'test',
      sharedTrackEventMetadata,
    );
  };

  const sendWaitingForLearnerTrackEvent = () => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      'test',
      sharedTrackEventMetadata,
    );
  };

  const sendErrorStateTrackEvent = () => {
    const errorReasonMetadata = !errorReason
      ? {
        errorReason: null,
      }
      : {
        errorReason: errorReason.errorReason,
        actionType: errorReason.actionType,
      };
    const errorStateMetadata = {
      ...sharedTrackEventMetadata,
      ...errorReasonMetadata,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      'test',
      errorStateMetadata,
    );
  };

  // Learner state is not available for this assignment, so don't display anything.
  if (!learnerState) {
    return null;
  }

  // Display the appropriate status chip based on the learner state.
  if (learnerState === 'notifying') {
    return (
      <NotifyingLearner learnerEmail={learnerEmail} trackEvent={sendNotifyLearnerTrackEvent} />
    );
  }

  if (learnerState === 'waiting') {
    return (
      <WaitingForLearner learnerEmail={learnerEmail} trackEvent={sendWaitingForLearnerTrackEvent} />
    );
  }

  if (learnerState === 'failed') {
    // If learnerState is failed but no error reason is defined, return a failed system chip.
    if (!errorReason) {
      return <FailedSystem trackEvent={sendErrorStateTrackEvent} />;
    }
    // Determine which failure chip to display based on the error reason.
    if (errorReason.actionType === 'notified') {
      if (errorReason.errorReason === 'email_error') {
        return (
          <FailedBadEmail learnerEmail={learnerEmail} trackEvent={sendErrorStateTrackEvent} />
        );
      }
      return <FailedSystem trackEvent={sendErrorStateTrackEvent} />;
    }
    if (errorReason.actionType === 'cancelled') {
      return <FailedCancellation trackEvent={sendErrorStateTrackEvent} />;
    }
    if (errorReason.actionType === 'reminded') {
      return <FailedReminder trackEvent={sendErrorStateTrackEvent} />;
    }
  }

  // Note: The given `learnerState` not officially supported with a `ModalPopup`, but display it anyway.
  return <Chip>{`${capitalizeFirstLetter(learnerState)}`}</Chip>;
};

AssignmentStatusTableCell.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      learnerEmail: PropTypes.string,
      learnerState: PropTypes.string.isRequired,
      errorReason: PropTypes.shape({
        actionType: PropTypes.string,
        errorReason: PropTypes.string,
      }),
      actions: PropTypes.arrayOf(PropTypes.shape({
        actionType: PropTypes.string.isRequired,
        errorReason: PropTypes.string,
      })).isRequired,
    }).isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AssignmentStatusTableCell);
