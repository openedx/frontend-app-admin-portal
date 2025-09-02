import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { Chip } from '@openedx/paragon';
import PropTypes from 'prop-types';
import WaitingForLearner from './request-status-chips/WaitingForLearner';
import FailedCancellation from './request-status-chips/FailedCancellation';
import FailedRedemption from './request-status-chips/FailedRedemption';
import { capitalizeFirstLetter } from '../../utils';
import {
  REQUEST_ERROR_STATES, useBudgetId, useSubsidyAccessPolicy,
  LEARNER_CREDIT_REQUEST_STATES, LEARNER_CREDIT_REQUEST_STATE_LABELS,
} from './data';

const RequestStatusTableCell = ({ enterpriseId, row }) => {
  const { original } = row;
  const {
    email: learnerEmail,
    learnerRequestState,
    lastActionErrorReason,
  } = original;

  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(
    subsidyAccessPolicyId,
  );
  const sharedTrackEventMetadata = {
    learnerRequestState,
    subsidyAccessPolicy,
  };

  const sendGenericTrackEvent = (eventName, eventMetadata = {}) => {
    sendEnterpriseTrackEvent(enterpriseId, eventName, {
      ...sharedTrackEventMetadata,
      ...eventMetadata,
    });
  };

  const sendErrorStateTrackEvent = (eventName, eventMetadata = {}) => {
    const errorReasonMetadata = {
      erroredAction: {
        errorReason: lastActionErrorReason || null,
      },
    };
    const errorStateMetadata = {
      ...sharedTrackEventMetadata,
      ...errorReasonMetadata,
      ...eventMetadata,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      eventName,
      errorStateMetadata,
    );
  };

  // Learner request state is not available, so don't display anything.
  if (!learnerRequestState) {
    return null;
  }

  // Handle specific learner request states with appropriate chips
  if (learnerRequestState === LEARNER_CREDIT_REQUEST_STATES.waiting) {
    return (
      <WaitingForLearner learnerEmail={learnerEmail} trackEvent={sendGenericTrackEvent} />
    );
  }

  if (learnerRequestState === LEARNER_CREDIT_REQUEST_STATES.failed) {
    // Determine which failure chip to display based on the error reason
    if (lastActionErrorReason === REQUEST_ERROR_STATES.failed_cancellation) {
      return <FailedCancellation trackEvent={sendErrorStateTrackEvent} />;
    }
    if (lastActionErrorReason === REQUEST_ERROR_STATES.failed_redemption) {
      return <FailedRedemption trackEvent={sendErrorStateTrackEvent} />;
    }
    // For other failure cases, display a generic failed chip
    return (
      <Chip variant="dark">
        {LEARNER_CREDIT_REQUEST_STATE_LABELS.failed}
      </Chip>
    );
  }

  // For all other states, display the appropriate label
  const displayLabel = LEARNER_CREDIT_REQUEST_STATE_LABELS[learnerRequestState]
    || capitalizeFirstLetter(learnerRequestState);

  return <Chip>{displayLabel}</Chip>;
};

RequestStatusTableCell.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      email: PropTypes.string,
      learnerRequestState: PropTypes.string,
      lastActionErrorReason: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(RequestStatusTableCell);
