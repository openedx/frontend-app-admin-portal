import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { Mail } from '@edx/paragon/icons';
import useRemindContentAssignments from './data/hooks/useRemindContentAssignments';
import RemindAssignmentModal from './RemindAssignmentModal';
import { getActiveTableColumnFilters } from '../../utils';

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
  selectedFlatRows, isEntireTableSelected, learnerStateCounts, tableInstance,
}) => {
  const assignmentUuids = selectedFlatRows.filter(row => row.original.learnerState === 'waiting').map(({ id }) => id);
  const assignmentConfigurationUuid = selectedFlatRows[0].original.assignmentConfiguration;

  const activeFilters = getActiveTableColumnFilters(tableInstance.columns);

  // If entire table is selected and there are NO filters, hit remind-all endpoint. Otherwise, hit usual bulk remind.
  const shouldRemindAll = isEntireTableSelected && activeFilters.length === 0;

  const {
    remindButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  } = useRemindContentAssignments(assignmentConfigurationUuid, assignmentUuids, shouldRemindAll);

  const selectedRemindableRowCount = calculateTotalToRemind({
    assignmentUuids,
    isEntireTableSelected: shouldRemindAll,
    learnerStateCounts,
  });

  return (
    <>
      <Button
        disabled={selectedRemindableRowCount === 0}
        alt={`Send reminder to ${selectedRemindableRowCount} learners`}
        iconBefore={Mail}
        onClick={open}
      >
        {`Remind (${selectedRemindableRowCount})`}
      </Button>
      <RemindAssignmentModal
        remindContentAssignments={remindContentAssignments}
        close={close}
        isOpen={isOpen}
        remindButtonState={remindButtonState}
        uuidCount={selectedRemindableRowCount}
      />
    </>
  );
};

AssignmentTableRemindAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  isEntireTableSelected: PropTypes.bool.isRequired,
  learnerStateCounts: PropTypes.arrayOf(PropTypes.shape({
    learnerState: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  })).isRequired,
  tableInstance: PropTypes.shape({
    columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  }).isRequired,
};

export default AssignmentTableRemindAction;
