import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { Mail } from '@edx/paragon/icons';
import useRemindContentAssignments from './data/hooks/useRemindContentAssignments';
import RemindAssignmentModal from './RemindAssignmentModal';

const AssignmentTableRemindAction = ({ selectedFlatRows }) => {
  const assignmentUuids = selectedFlatRows.filter(row => row.original.learnerState === 'waiting').map(({ id }) => id);
  const assignmentConfigurationUuid = selectedFlatRows[0].original.assignmentConfiguration;
  const selectedRemindableRows = selectedFlatRows.filter(row => row.original.learnerState === 'waiting').length;
  const {
    assignButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  } = useRemindContentAssignments(assignmentConfigurationUuid, assignmentUuids);
  return (
    <>
      <Button
        disabled={selectedRemindableRows === 0}
        alt={`Send reminder to ${selectedRemindableRows} learners`}
        iconBefore={Mail}
        onClick={open}
      >
        {`Remind (${selectedRemindableRows})`}
      </Button>
      <RemindAssignmentModal
        remindContentAssignments={remindContentAssignments}
        close={close}
        isOpen={isOpen}
        assignButtonState={assignButtonState}
        uuidCount={assignmentUuids.length}
      />
    </>
  );
};

AssignmentTableRemindAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
};

AssignmentTableRemindAction.defaultProps = {
  selectedFlatRows: [],
};

export default AssignmentTableRemindAction;
