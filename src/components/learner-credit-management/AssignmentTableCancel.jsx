import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { DoNotDisturbOn } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import CancelAssignmentModal from './CancelAssignmentModal';
import useCancelContentAssignments from './data/hooks/useCancelContentAssignments';
import { transformSelectedRows, useBudgetId, useSubsidyAccessPolicy } from './data';
import EVENT_NAMES from '../../eventTracking';

const calculateTotalToCancel = ({
  assignmentUuids,
  isEntireTableSelected,
  tableItemCount,
}) => {
  if (isEntireTableSelected) {
    return tableItemCount;
  }
  return assignmentUuids.length;
};

const AssignmentTableCancelAction = ({
  selectedFlatRows, isEntireTableSelected, learnerStateCounts, tableInstance, enterpriseId,
}) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    subsidyUuid, assignmentConfiguration, isSubsidyActive, isAssignable, catalogUuid, aggregates,
  } = subsidyAccessPolicy;

  const {
    uniqueLearnerState,
    uniqueAssignmentState,
    uniqueContentKeys,
    totalContentQuantity,
    assignmentUuids,
    totalSelectedRows,
  } = transformSelectedRows(selectedFlatRows);

  const { state: dataTableState } = tableInstance;

  const {
    cancelButtonState,
    cancelContentAssignments,
    close,
    isOpen,
    open,
  } = useCancelContentAssignments(
    assignmentConfiguration.uuid,
    assignmentUuids,
    isEntireTableSelected,
    dataTableState.filters,
  );

  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_BULK_CANCEL_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_BULK_CANCEL_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_BULK_CANCEL,
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
      BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_BULK_CANCEL_MODAL,
    );
  };

  const closeModal = () => {
    close();
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_BULK_CANCEL_MODAL,
    );
  };

  const cancellationTrackEvent = () => {
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_BULK_CANCEL,
    );
  };

  const tableItemCount = tableInstance.itemCount;
  const totalToCancel = calculateTotalToCancel({
    assignmentUuids,
    isEntireTableSelected,
    tableItemCount,
  });

  return (
    <>
      <Button variant="danger" iconBefore={DoNotDisturbOn} onClick={openModal}>
        <FormattedMessage
          id="lcm.budget.detail.page.catalog.tab.course.card.cancel"
          defaultMessage="Cancel ({totalToCancel})"
          description="Button text to cancel the selected assignments"
          values={{ totalToCancel }}
        />
      </Button>
      <CancelAssignmentModal
        cancelContentAssignments={cancelContentAssignments}
        close={closeModal}
        isOpen={isOpen}
        cancelButtonState={cancelButtonState}
        trackEvent={cancellationTrackEvent}
        uuidCount={totalToCancel}
      />
    </>
  );
};

AssignmentTableCancelAction.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  isEntireTableSelected: PropTypes.bool.isRequired,
  learnerStateCounts: PropTypes.arrayOf(PropTypes.shape({
    learnerState: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  })).isRequired,
  tableInstance: PropTypes.shape({
    itemCount: PropTypes.number.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    state: PropTypes.shape({
      filters: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    }).isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AssignmentTableCancelAction);
