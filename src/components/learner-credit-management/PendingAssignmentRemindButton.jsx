import React from 'react';
import PropTypes from 'prop-types';
import { Icon, IconButtonWithTooltip } from '@edx/paragon';

import { Mail } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import RemindAssignmentModal from './RemindAssignmentModal';
import useRemindContentAssignments from './data/hooks/useRemindContentAssignments';
import EVENT_NAMES from '../../eventTracking';
import { useBudgetId, useSubsidyAccessPolicy } from './data';

const PendingAssignmentRemindButton = ({ row, enterpriseId }) => {
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
    remindButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  } = useRemindContentAssignments(assignmentConfiguration, [uuid]);

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
    BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_REMIND_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_REMIND_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_REMIND,
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
      BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_REMIND_MODAL,
    );
  };

  const closeModal = () => {
    close();
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_REMIND_MODAL,
    );
  };

  const reminderTrackEvent = () => {
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_REMIND,
    );
  };

  return (
    <>
      <IconButtonWithTooltip
        alt={`Remind learner ${emailAltText}`}
        data-testid={`remind-assignment-${row.original.uuid}`}
        iconAs={Icon}
        onClick={openModal}
        src={Mail}
        tooltipContent="Remind learner"
        tooltipPlacement="top"
      />
      <RemindAssignmentModal
        remindButtonState={remindButtonState}
        close={closeModal}
        remindContentAssignments={remindContentAssignments}
        isOpen={isOpen}
        trackEvent={reminderTrackEvent}
      />
    </>
  );
};

PendingAssignmentRemindButton.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      contentKey: PropTypes.string.isRequired,
      contentQuantity: PropTypes.number.isRequired,
      learnerState: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      assignmentConfiguration: PropTypes.string.isRequired,
      learnerEmail: PropTypes.string,
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(PendingAssignmentRemindButton);
