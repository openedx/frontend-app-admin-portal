import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon, IconButton, OverlayTrigger, Stack, Tooltip,
} from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';
import PendingAssignmentRemindButton from './PendingAssignmentRemindButton';

const AssignmentRowActionTableCell = ({ row }) => {
  const isLearnerStateWaiting = row.original.learnerState === 'waiting';
  const emailAltText = row.original.learnerEmail ? `for ${row.original.learnerEmail}` : '';
  return (
    <Stack direction="horizontal" gap={2} className="justify-content-end">
      {isLearnerStateWaiting && (
      <PendingAssignmentRemindButton row={row} />
      )}
      <OverlayTrigger
        key="Cancel"
        placement="top"
        overlay={<Tooltip id={`tooltip-cancel-${row.original.uuid}`}>Cancel assignment</Tooltip>}
      >
        <IconButton
          variant="danger"
          src={DoNotDisturbOn}
          iconAs={Icon}
          alt={`Cancel assignment ${emailAltText}`}
          // eslint-disable-next-line no-console
          onClick={() => console.log(`Canceling ${row.original.uuid}`)}
          data-testid={`cancel-assignment-${row.original.uuid}`}
        />
      </OverlayTrigger>
    </Stack>
  );
};

AssignmentRowActionTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      assignmentConfiguration: PropTypes.string,
      learnerEmail: PropTypes.string,
      learnerState: PropTypes.string,
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default AssignmentRowActionTableCell;
