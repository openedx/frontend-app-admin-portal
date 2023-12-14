import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { DoNotDisturbOn } from '@openedx/paragon/icons';
import CancelAssignmentModal from './CancelAssignmentModal';
import useCancelContentAssignments from './data/hooks/useCancelContentAssignments';

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
  const {
    cancelButtonState,
    cancelContentAssignments,
    close,
    isOpen,
    open,
  } = useCancelContentAssignments(assignmentConfigurationUuid, assignmentUuids, isEntireTableSelected);

  const tableItemCount = tableInstance.itemCount;
  const totalToCancel = calculateTotalToCancel({
    assignmentUuids,
    isEntireTableSelected,
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
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
  isEntireTableSelected: PropTypes.bool,
  tableInstance: PropTypes.shape({
    itemCount: PropTypes.number.isRequired,
  }),
};

AssignmentTableCancelAction.defaultProps = {
  selectedFlatRows: [],
  isEntireTableSelected: false,
  tableInstance: {
    itemCount: 0,
  },
};

export default AssignmentTableCancelAction;
