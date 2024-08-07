import { Chip } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import FailedBadEmail from './assignments-status-chips/FailedBadEmail';
import FailedCancellation from './assignments-status-chips/FailedCancellation';
import FailedRedemption from './assignments-status-chips/FailedRedemption';
import FailedReminder from './assignments-status-chips/FailedReminder';
import FailedSystem from './assignments-status-chips/FailedSystem';
import NotifyingLearner from './assignments-status-chips/NotifyingLearner';
import WaitingForLearner from './assignments-status-chips/WaitingForLearner';
import { capitalizeFirstLetter } from '../../utils';
import {
  getBudgetStatus,
  useBudgetId,
  useSubsidyAccessPolicy,
} from './data';
import IncompleteAssignment from './assignments-status-chips/IncompleteAssignment';
import { BUDGET_STATUSES } from '../EnterpriseApp/data/constants';

const AssignmentStatusTableCell = ({ enterpriseId, row }) => {
  const intl = useIntl();
  const { original } = row;
  const {
    learnerEmail,
    learnerState,
    errorReason,
  } = original;
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const { status } = getBudgetStatus({
    intl,
    startDateStr: subsidyAccessPolicy.subsidyActiveDatetime,
    endDateStr: subsidyAccessPolicy.subsidyExpirationDatetime,
    isBudgetRetired: subsidyAccessPolicy.retired,
  });
  const {
    subsidyUuid, assignmentConfiguration, isSubsidyActive, isAssignable, catalogUuid, aggregates,
  } = subsidyAccessPolicy;
  const budgetStatusesWithIncompleteAssignments = [BUDGET_STATUSES.expired, BUDGET_STATUSES.retired];
  const sharedTrackEventMetadata = {
    learnerState,
    subsidyUuid,
    assignmentConfiguration,
    isSubsidyActive,
    isAssignable,
    catalogUuid,
    aggregates,
  };

  const sendGenericTrackEvent = (eventName, eventMetadata = {}) => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      eventName,
      {
        ...sharedTrackEventMetadata,
        ...eventMetadata,
      },
    );
  };

  const sendErrorStateTrackEvent = (eventName, eventMetadata = {}) => {
    const errorReasonMetadata = {
      erroredAction: {
        errorReason: errorReason?.errorReason || null,
        actionType: errorReason?.actionType || null,
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

  // Learner state is not available for this assignment, so don't display anything.
  if (!learnerState) {
    return null;
  }

  // Always display "Incomplete assignment" status chip for retired budgets
  if (budgetStatusesWithIncompleteAssignments.includes(status)) {
    return (
      <IncompleteAssignment trackEvent={sendGenericTrackEvent} />
    );
  }

  if (learnerState === 'notifying') {
    return (
      <NotifyingLearner learnerEmail={learnerEmail} trackEvent={sendGenericTrackEvent} />
    );
  }

  if (learnerState === 'waiting') {
    return (
      <WaitingForLearner learnerEmail={learnerEmail} trackEvent={sendGenericTrackEvent} />
    );
  }

  if (learnerState === 'failed') {
    // If learnerState is failed but no top-level error reason is defined, return a failed system chip.
    if (!errorReason) {
      return <FailedSystem trackEvent={sendErrorStateTrackEvent} />;
    }
    // Determine which failure chip to display based on the top level errorReason. In most cases, the actual errorReason
    // code is ignored, in which case we key off the actionType.
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
    if (errorReason.actionType === 'redeemed') {
      return <FailedRedemption trackEvent={sendErrorStateTrackEvent} />;
    }
    // In all other unexpected cases, return a failed system chip.
    return <FailedSystem trackEvent={sendErrorStateTrackEvent} />;
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
