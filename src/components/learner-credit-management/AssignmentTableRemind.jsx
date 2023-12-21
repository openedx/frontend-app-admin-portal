import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { Mail } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import useRemindContentAssignments from './data/hooks/useRemindContentAssignments';
import RemindAssignmentModal from './RemindAssignmentModal';
import { transformSelectedRows, useBudgetId, useSubsidyAccessPolicy } from './data';
import EVENT_NAMES from '../../eventTracking';
import { getActiveTableColumnFilters } from '../../utils';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';

const calculateTotalToRemind = ({
  assignmentUuids,
  isEntireTableSelected,
  learnerStateCounts,
}) => {
  if (isEntireTableSelected) {
    const waitingAssignmentCounts = learnerStateCounts.filter(({ learnerState }) => (learnerState === 'waiting'));
    return waitingAssignmentCounts.length ? waitingAssignmentCounts[0].count : 0;
  }
  return assignmentUuids.length;
};

const AssignmentTableRemindAction = ({
  selectedFlatRows, isEntireTableSelected, learnerStateCounts, tableInstance, enterpriseId,
}) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    subsidyUuid, assignmentConfiguration, isSubsidyActive, isAssignable, catalogUuid, aggregates,
  } = subsidyAccessPolicy;

  const { user } = useContext(EnterpriseAppContext);

  const remindableRows = selectedFlatRows.filter(row => row.original.learnerState === 'waiting');
  const {
    uniqueLearnerState,
    uniqueAssignmentState,
    uniqueContentKeys,
    totalContentQuantity,
    assignmentUuids,
    totalSelectedRows,
  } = transformSelectedRows(remindableRows);

  const activeFilters = getActiveTableColumnFilters(tableInstance.columns);

  // If entire table is selected and there are NO filters, hit remind-all endpoint. Otherwise, hit usual bulk remind.
  const shouldRemindAll = isEntireTableSelected && activeFilters.length === 0;

  const {
    remindButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  } = useRemindContentAssignments(assignmentConfiguration.uuid, assignmentUuids, shouldRemindAll);

  const selectedRemindableRowCount = calculateTotalToRemind({
    assignmentUuids,
    isEntireTableSelected: shouldRemindAll,
    learnerStateCounts,
  });

  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_BULK_REMIND_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_BULK_REMIND_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_BULK_REMIND,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const trackEvent = (eventName) => {
    // constructs a learner state object for the select all state to match format of select all on page metadata
    const learnerStateObject = {};
    learnerStateCounts.forEach((learnerState) => {
      learnerStateObject[learnerState.learnerState] = learnerState.count;
    });

    const selectedRowsMetadata = isEntireTableSelected
      ? { uniqueLearnerState: learnerStateObject, totalSelectedRows: tableInstance.itemCount }
      : {
        uniqueLearnerState, uniqueAssignmentState, uniqueContentKeys, totalContentQuantity, totalSelectedRows,
      };

    const trackEventMetadata = {
      ...selectedRowsMetadata,
      isAssignable,
      isSubsidyActive,
      subsidyUuid,
      catalogUuid,
      isEntireTableSelected,
      assignmentUuids,
      aggregates,
      userId: user.id,
      email: user.email,
      assignmentConfiguration,
      isOpen: !isOpen,
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
      BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_BULK_REMIND_MODAL,
    );
  };

  const closeModal = () => {
    close();
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_BULK_REMIND_MODAL,
    );
  };

  const reminderTrackEvent = () => {
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_BULK_REMIND,
    );
  };

  return (
    <>
      <Button
        disabled={selectedRemindableRowCount === 0}
        alt={`Send reminder to ${selectedRemindableRowCount} learners`}
        iconBefore={Mail}
        onClick={openModal}
      >
        {`Remind (${selectedRemindableRowCount})`}
      </Button>
      <RemindAssignmentModal
        remindContentAssignments={remindContentAssignments}
        close={closeModal}
        isOpen={isOpen}
        remindButtonState={remindButtonState}
        trackEvent={reminderTrackEvent}
        uuidCount={selectedRemindableRowCount}
      />
    </>
  );
};

AssignmentTableRemindAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  enterpriseId: PropTypes.string.isRequired,
  isEntireTableSelected: PropTypes.bool.isRequired,
  learnerStateCounts: PropTypes.arrayOf(PropTypes.shape({
    learnerState: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  })).isRequired,
  tableInstance: PropTypes.shape({
    columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    itemCount: PropTypes.number.isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AssignmentTableRemindAction);
