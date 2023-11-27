import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon, IconButton, OverlayTrigger, Stack, Tooltip,
} from '@edx/paragon';
import { Mail } from '@edx/paragon/icons';
import PendingAssignmentCancelButton from './PendingAssignmentCancelButton';

const AssignmentRowActionTableCell = ({ row }) => {
  const isLearnerStateWaiting = row.original.learnerState === 'waiting';
  const emailAltText = row.original.learnerEmail ? `for ${row.original.learnerEmail}` : '';
  return (
    <Stack direction="horizontal" gap={2} className="justify-content-end">
      {isLearnerStateWaiting && (
        <OverlayTrigger
          key="Remind"
          placement="top"
          overlay={<Tooltip id={`tooltip-remind-${row.original.uuid}`}>Remind learner</Tooltip>}
        >
          <IconButton
            src={Mail}
            iconAs={Icon}
            alt={`Send reminder ${emailAltText}`}
            // eslint-disable-next-line no-console
            onClick={() => console.log(`Reminding ${row.original.uuid}`)}
            data-testid={`remind-assignment-${row.original.uuid}`}
          />
        </OverlayTrigger>
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
