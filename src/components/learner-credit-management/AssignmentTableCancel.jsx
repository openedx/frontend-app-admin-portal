import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';
import CancelAssignmentModal from './CancelAssignmentModal';
import useCancelContentAssignments from './data/hooks/useCancelContentAssignments';
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

const AssignmentTableCancelAction = ({ selectedFlatRows, isEntireTableSelected, tableInstance }) => {
  const assignmentUuids = selectedFlatRows.map(row => row.id);
  const assignmentConfigurationUuid = selectedFlatRows[0].original.assignmentConfiguration;

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

  const tableItemCount = tableInstance.itemCount;
  const totalToCancel = calculateTotalToCancel({
    assignmentUuids,
    isEntireTableSelected: shouldCancelAll,
    tableItemCount,
  });

  return (
    <>
      <Button variant="danger" iconBefore={DoNotDisturbOn} onClick={open}>
        {`Cancel (${totalToCancel})`}
      </Button>
      <CancelAssignmentModal
        cancelContentAssignments={cancelContentAssignments}
        close={close}
        isOpen={isOpen}
        cancelButtonState={cancelButtonState}
        uuidCount={totalToCancel}
      />
    </>
  );
};

AssignmentTableCancelAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  isEntireTableSelected: PropTypes.bool.isRequired,
  tableInstance: PropTypes.shape({
    itemCount: PropTypes.number.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  }).isRequired,
};

export default AssignmentTableCancelAction;
