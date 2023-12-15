import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import CancelAssignmentModal from './CancelAssignmentModal';
import useCancelContentAssignments from './data/hooks/useCancelContentAssignments';
import { transformSelectedRows } from './data';
import EVENT_NAMES from '../../eventTracking';
import { getActiveTableColumnFilters } from '../../utils';

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
  selectedFlatRows, isEntireTableSelected, tableInstance, enterpriseId,
}) => {
  const {
    uniqueLearnerState,
    uniqueAssignmentState,
    uniqueContentKeys,
    assignmentConfigurationUuid,
    assignmentUuids,
    totalSelectedRows,
  } = transformSelectedRows(selectedFlatRows);

  const activeFilters = getActiveTableColumnFilters(tableInstance.columns);

  // If entire table is selected and there are NO filters, hit cancel-all endpoint. Otherwise, hit usual bulk cancel.
  const shouldCancelAll = isEntireTableSelected && activeFilters.length === 0;

  const {
    cancelButtonState,
    cancelContentAssignments,
    close,
    isOpen,
    open,
  } = useCancelContentAssignments(assignmentConfigurationUuid, assignmentUuids, shouldCancelAll);

  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_BULK_CANCEL_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_BULK_CANCEL_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_BULK_CANCEL,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const trackEvent = (eventName) => {
    const trackEventMetadata = {
      uniqueLearnerState,
      uniqueContentKeys,
      uniqueAssignmentState,
      assignmentConfigurationUuid,
      totalSelectedRows,
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
    isEntireTableSelected: shouldCancelAll,
    tableItemCount,
  });

  return (
    <>
      <Button variant="danger" iconBefore={DoNotDisturbOn} onClick={openModal}>
        {`Cancel (${totalToCancel})`}
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
  tableInstance: PropTypes.shape({
    itemCount: PropTypes.number.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AssignmentTableCancelAction);
