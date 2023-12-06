import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';
import CancelAssignmentModal from './CancelAssignmentModal';
import useCancelContentAssignments from './data/hooks/useCancelContentAssignments';

const AssignmentTableCancelAction = ({ selectedFlatRows }) => {
  const assignmentUuids = selectedFlatRows.map(row => row.id);
  const assignmentConfigurationUuid = selectedFlatRows[0].original.assignmentConfiguration;
  const {
    cancelButtonState,
    cancelContentAssignments,
    close,
    isOpen,
    open,
  } = useCancelContentAssignments(assignmentConfigurationUuid, assignmentUuids);

  return (
    <>
      <Button variant="danger" iconBefore={DoNotDisturbOn} onClick={open}>
        {`Cancel (${assignmentUuids.length})`}
      </Button>
      <CancelAssignmentModal
        cancelContentAssignments={cancelContentAssignments}
        close={close}
        isOpen={isOpen}
        cancelButtonState={cancelButtonState}
        uuidCount={assignmentUuids.length}
      />
    </>
  );
};

AssignmentTableCancelAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
};

AssignmentTableCancelAction.defaultProps = {
  selectedFlatRows: [],
};

export default AssignmentTableCancelAction;
