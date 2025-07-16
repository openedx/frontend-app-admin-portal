import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { Chip } from '@openedx/paragon';
import PropTypes from 'prop-types';
import WaitingForLearner from './request-status-chips/WaitingForLearner';
import FailedCancellation from './request-status-chips/FailedCancellation';
import { capitalizeFirstLetter } from '../../utils';
import { useBudgetId, useSubsidyAccessPolicy } from './data';

const RequestStatusTableCell = ({ enterpriseId, row }) => {
  const { original } = row;
  const {
    learnerEmail,
    lastActionStatus,
    lastActionErrorReason,
    requestStatus,
  } = original;

  // Use lastActionStatus if available, otherwise fall back to requestStatus
  // There is a lot of complexity around status field inconsistencies across different data sources,
  // but these inconsistencies can only be resolved by API improvements.
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(
    subsidyAccessPolicyId,
  );
  const sharedTrackEventMetadata = {
    learnerEmail,
    requestStatus,
    subsidyAccessPolicy,
  };

  const sendGenericTrackEvent = (eventName, eventMetadata = {}) => {
    sendEnterpriseTrackEvent(enterpriseId, eventName, {
      ...sharedTrackEventMetadata,
      ...eventMetadata,
    });
  };

  // TODO: Consolidate status handling in future API improvements
  // Currently we check both `lastActionErrorReason` and `lastActionStatus` which creates
  // confusion since status information comes from two different sources. The API should
  // be updated to return a single, unified status field to simplify this logic.
  if (lastActionErrorReason === 'Failed: Cancellation') {
    return (
      <FailedCancellation
        learnerEmail={learnerEmail}
        trackEvent={sendGenericTrackEvent}
      />
    );
  }

  if (lastActionStatus === 'waiting_for_learner' || requestStatus === 'approved') {
    return (
      <WaitingForLearner
        learnerEmail={learnerEmail}
        trackEvent={sendGenericTrackEvent}
      />
    );
  }

  return (
    <Chip>
      {`${capitalizeFirstLetter(requestStatus)}`}
    </Chip>
  );
};

RequestStatusTableCell.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      requestStatus: PropTypes.string,
      learnerEmail: PropTypes.string,
      lastActionStatus: PropTypes.string,
      lastActionErrorReason: PropTypes.string,
      recentAction: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(RequestStatusTableCell);
