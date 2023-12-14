import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { Mail } from '@openedx/paragon/icons';
import useRemindContentAssignments from './data/hooks/useRemindContentAssignments';
import RemindAssignmentModal from './RemindAssignmentModal';

const AssignmentTableRemindAction = ({ selectedFlatRows }) => {
  const assignmentUuids = selectedFlatRows.filter(row => row.original.learnerState === 'waiting').map(({ id }) => id);
  const assignmentConfigurationUuid = selectedFlatRows[0].original.assignmentConfiguration;
  const selectedRemindableRows = selectedFlatRows.filter(row => row.original.learnerState === 'waiting').length;
  const {
    remindButtonState,
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
        remindButtonState={remindButtonState}
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
