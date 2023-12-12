import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { Mail } from '@edx/paragon/icons';
import useRemindContentAssignments from './data/hooks/useRemindContentAssignments';
import RemindAssignmentModal from './RemindAssignmentModal';

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

const AssignmentTableRemindAction = ({ selectedFlatRows, isEntireTableSelected, learnerStateCounts }) => {
  const assignmentUuids = selectedFlatRows.filter(row => row.original.learnerState === 'waiting').map(({ id }) => id);
  const assignmentConfigurationUuid = selectedFlatRows[0].original.assignmentConfiguration;
  const {
    remindButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  } = useRemindContentAssignments(assignmentConfigurationUuid, assignmentUuids, isEntireTableSelected);

  const selectedRemindableRowCount = calculateTotalToRemind({
    assignmentUuids,
    isEntireTableSelected,
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
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
  isEntireTableSelected: PropTypes.bool,
  learnerStateCounts: PropTypes.arrayOf(PropTypes.shape({
    learnerState: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  })).isRequired,
};

AssignmentTableRemindAction.defaultProps = {
  selectedFlatRows: [],
  isEntireTableSelected: false,
};

export default AssignmentTableRemindAction;
