import React from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@openedx/paragon';
import PendingAssignmentRemindButton from './PendingAssignmentRemindButton';
import PendingAssignmentCancelButton from './PendingAssignmentCancelButton';

const AssignmentRowActionTableCell = ({ row }) => {
  const isLearnerStateWaiting = row.original.learnerState === 'waiting';
  return (
    <Stack direction="horizontal" gap={2} className="justify-content-end">
      {isLearnerStateWaiting && (
        <PendingAssignmentRemindButton row={row} />
      )}
      <PendingAssignmentCancelButton row={row} />
    </Stack>
  );
};

AssignmentRowActionTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      learnerEmail: PropTypes.string,
      learnerState: PropTypes.string,
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default AssignmentRowActionTableCell;
