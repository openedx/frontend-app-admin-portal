import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  IconButton,
  OverlayTrigger,
  Stack,
  Tooltip,
} from '@edx/paragon';
import { Mail, DoNotDisturbOn } from '@edx/paragon/icons';

const AssignmentRowActionTableCell = ({ row }) => {
  const cancelButtonMarginLeft = row.original.state === 'allocated' ? 'ml-2.5' : 'ml-auto';
  return (
    <div className="d-flex">
      {row.original.state === 'allocated' && (
        <>
          <OverlayTrigger
            key="Remind"
            placement="top"
            overlay={<Tooltip variant="light" id="tooltip-remind">Remind learner</Tooltip>}
          >
            <IconButton
              className="ml-auto mr-0"
              src={Mail}
              iconAs={Icon}
              alt="Remind learner"
              // eslint-disable-next-line no-console
              onClick={() => console.log(`Reminding ${row.original.uuid}`)}
              data-testid={`remind-assignment-${row.original.uuid}`}
            />
          </OverlayTrigger>
          <Stack direction="horizontal" gap={1} />
        </>
      )}
      <OverlayTrigger
        key="Cancel"
        placement="top"
        overlay={<Tooltip variant="light" id="tooltip-cancel">Cancel assignment</Tooltip>}
      >
        <IconButton
          className={`${cancelButtonMarginLeft} mr-1 text-danger-500`}
          src={DoNotDisturbOn}
          iconAs={Icon}
          alt="Cancel assignment"
          // eslint-disable-next-line no-console
          onClick={() => console.log(`Canceling ${row.original.uuid}`)}
          data-testid={`cancel-assignment-${row.original.uuid}`}
        />
      </OverlayTrigger>
    </div>
  );
};

AssignmentRowActionTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default AssignmentRowActionTableCell;
