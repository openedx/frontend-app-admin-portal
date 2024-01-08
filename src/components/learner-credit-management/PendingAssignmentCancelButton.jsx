import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon, IconButtonWithTooltip,
} from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import useCancelContentAssignments from './data/hooks/useCancelContentAssignments';
import CancelAssignmentModal from './CancelAssignmentModal';
import EVENT_NAMES from '../../eventTracking';
import { useBudgetId, useSubsidyAccessPolicy } from './data';

const PendingAssignmentCancelButton = ({ row, enterpriseId }) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    subsidyUuid, assignmentConfiguration, isSubsidyActive, isAssignable, catalogUuid, aggregates,
  } = subsidyAccessPolicy;

  const emailAltText = row.original.learnerEmail ? `for ${row.original.learnerEmail}` : '';
  const {
    contentKey,
    contentQuantity,
    learnerState,
    state,
    uuid,
  } = row.original;

  const {
    cancelButtonState,
    cancelContentAssignments,
    close,
    isOpen,
    open,
  } = useCancelContentAssignments(assignmentConfiguration.uuid, [uuid]);

  const sharedTrackEventMetadata = {
    subsidyUuid,
    isSubsidyActive,
    isAssignable,
    catalogUuid,
    assignmentConfiguration,
    contentKey,
    contentQuantity,
    learnerState,
    aggregates,
    assignmentState: state,
    isOpen: !isOpen,
  };

  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_CANCEL_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_CANCEL_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CANCEL,
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
      BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_CANCEL_MODAL,
    );
  };

  const closeModal = () => {
    close();
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_CANCEL_MODAL,
    );
  };

  const cancellationTrackEvent = () => {
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_CANCEL,
    );
  };

  return (
    <>
      <IconButtonWithTooltip
        alt={`Cancel assignment ${emailAltText}`}
        data-testid={`cancel-assignment-${row.original.uuid}`}
        iconAs={Icon}
        onClick={openModal}
        src={DoNotDisturbOn}
        tooltipContent="Cancel assignment"
        tooltipPlacement="top"
        variant="danger"
      />
      <CancelAssignmentModal
        cancelButtonState={cancelButtonState}
        close={closeModal}
        cancelContentAssignments={cancelContentAssignments}
        isOpen={isOpen}
        trackEvent={cancellationTrackEvent}
      />
    </>
  );
};

PendingAssignmentCancelButton.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      contentKey: PropTypes.string.isRequired,
      contentQuantity: PropTypes.number.isRequired,
      learnerState: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      assignmentConfiguration: PropTypes.shape({
        uuid: PropTypes.string.isRequired,
      }).isRequired,
      learnerEmail: PropTypes.string,
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(PendingAssignmentCancelButton);
