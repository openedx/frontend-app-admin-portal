import React from 'react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { Chip } from '@openedx/paragon';
import PropTypes from 'prop-types';
import WaitingForLearner from './request-status-chips/WaitingForLearner';
import FailedCancellation from './request-status-chips/FailedCancellation';
import { capitalizeFirstLetter } from '../../utils';
import { useBudgetId, useSubsidyAccessPolicy } from './data';

const mapLatestActionToStatus = (latestAction) => {
  if (latestAction?.errorReason === 'failed_cancellation') {
    return 'failed_cancellation';
  }

  if (
    latestAction?.status === 'approved'
    || latestAction?.status === 'reminded'
  ) {
    return 'waiting_for_learner';
  }

  return 'error';
};

const RequestStatusTableCell = ({ enterpriseId, row }) => {
  const { original } = row;
  const { learnerEmail, latestAction, requestStatus } = original;
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

  const status = mapLatestActionToStatus(latestAction);

  if (status === 'failed_cancellation') {
    return (
      <FailedCancellation
        learnerEmail={learnerEmail}
        trackEvent={sendGenericTrackEvent}
      />
    );
  }

  if (status === 'waiting_for_learner') {
    return (
      <WaitingForLearner
        learnerEmail={learnerEmail}
        trackEvent={sendGenericTrackEvent}
      />
    );
  }

  return <Chip>{`${capitalizeFirstLetter(status)}`}</Chip>;
};

RequestStatusTableCell.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      requestStatus: PropTypes.string.isRequired,
      learnerEmail: PropTypes.string,
      latestAction: PropTypes.shape({
        uuid: PropTypes.string,
        status: PropTypes.string.isRequired,
      }),
    }).isRequired,
  }).isRequired,
};

export default RequestStatusTableCell;
