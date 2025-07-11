import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Icon, IconButtonWithTooltip,
} from '@openedx/paragon';
import { DoNotDisturbOn } from '@openedx/paragon/icons';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import useCancelApprovedRequest from './data/hooks/useCancelApprovedRequest';
import CancelApprovalModal from './CancelApprovalModal';
import EVENT_NAMES from '../../eventTracking';
import { useBudgetId, useSubsidyAccessPolicy } from './data';

const CancelApprovalButton = ({ row, enterpriseId }) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    subsidyUuid, assignmentConfiguration, isSubsidyActive, isAssignable, catalogUuid, aggregates,
  } = subsidyAccessPolicy;

  const emailAltText = row.original.learnerEmail ? `for ${row.original.learnerEmail}` : '';
  const {
    uuid,
    learnerEmail,
    lastActionStatus,
    requestStatus,
    courseTitle,
    courseListPrice,
  } = row.original;

  // Handle successful cancellation - move request to "Request" tab with "Cancelled" status
  const handleSuccessfulCancellation = useCallback(() => {
    // The request will be moved to the Request tab automatically via query invalidation
    // and the status will be updated to "Cancelled" by the backend
  }, []);

  // Handle failed cancellation - update status to "Failed: Cancellation"
  const handleFailedCancellation = useCallback(() => {
    // Update the row data to show "Failed: Cancellation" status
    // This will be handled by the RequestStatusTableCell component
    // which already checks for lastActionErrorReason === 'Failed: Cancellation'
  }, []);

  const {
    cancelButtonState,
    cancelApprovedRequest,
    close,
    isOpen,
    open,
  } = useCancelApprovedRequest(
    enterpriseId,
    uuid,
    handleSuccessfulCancellation,
    handleFailedCancellation,
  );

  // Only show cancel button for approved requests where learner hasn't enrolled/redeemed
  const shouldShowCancelButton = () => (
    // Check if the request is approved and learner is waiting
    (lastActionStatus === 'waiting_for_learner' || requestStatus === 'approved')
    && lastActionStatus !== 'redeemed'
    && lastActionStatus !== 'enrolled'
  );

  const sharedTrackEventMetadata = {
    subsidyUuid,
    isSubsidyActive,
    isAssignable,
    catalogUuid,
    assignmentConfiguration,
    aggregates,
    learnerEmail,
    requestStatus,
    lastActionStatus,
    courseTitle,
    courseListPrice,
    subsidyRequestUUID: uuid,
  };

  const {
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_OPEN_CANCEL_MODAL,
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CLOSE_CANCEL_MODAL,
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CANCEL,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const trackEvent = (eventName, eventMetadata = {}) => {
    const trackEventMetadata = {
      ...sharedTrackEventMetadata,
      ...eventMetadata,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      eventName,
      trackEventMetadata,
    );
  };

  const openModal = () => {
    open();
    trackEvent(
      BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_OPEN_CANCEL_MODAL,
    );
  };

  const closeModal = () => {
    close();
    trackEvent(
      BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CLOSE_CANCEL_MODAL,
    );
  };

  const cancellationTrackEvent = () => {
    trackEvent(
      BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CANCEL,
    );
  };

  // Don't render the button if conditions aren't met
  if (!shouldShowCancelButton()) {
    return null;
  }

  return (
    <>
      <IconButtonWithTooltip
        alt={`Cancel approval ${emailAltText}`}
        data-testid={`cancel-approval-${row.original.uuid}`}
        iconAs={Icon}
        onClick={openModal}
        src={DoNotDisturbOn}
        tooltipContent="Cancel approval"
        tooltipPlacement="top"
        variant="danger"
      />
      <CancelApprovalModal
        cancelButtonState={cancelButtonState}
        close={closeModal}
        cancelApprovedRequest={cancelApprovedRequest}
        isOpen={isOpen}
        trackEvent={cancellationTrackEvent}
      />
    </>
  );
};

CancelApprovalButton.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      learnerEmail: PropTypes.string,
      lastActionStatus: PropTypes.string,
      requestStatus: PropTypes.string,
      courseTitle: PropTypes.string,
      courseListPrice: PropTypes.string,
    }).isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(CancelApprovalButton);
